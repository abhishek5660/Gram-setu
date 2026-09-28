import { Router, Request, Response } from 'express';

const router = Router();

// Google Cloud Text-to-Speech has an explicit, well-supported gu-IN voice,
// which is exactly what device-level speechSynthesis can't guarantee on every
// phone (iOS in particular ships no Gujarati voice unless the user manually
// installs one). Routing Gujarati synthesis through here makes it a
// capability of the app itself instead of a capability of the user's device.
const SUPPORTED_LANGS = new Set(['gu-IN', 'hi-IN', 'en-IN']);

// In-memory cache: the vast majority of spoken text in this app is a small,
// repeated set of button/page announcements (see VoiceAnnouncer + the fixed
// voice.* strings), so caching by exact (lang, text) avoids re-paying for
// the same synthesis call over and over across every user's session.
const audioCache = new Map<string, Buffer>();
const MAX_CACHE_ENTRIES = 300;

function cacheSet(key: string, buf: Buffer) {
  if (audioCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = audioCache.keys().next().value;
    if (oldestKey !== undefined) audioCache.delete(oldestKey);
  }
  audioCache.set(key, buf);
}

async function synthesizeWithGoogleCloudTts(text: string, languageCode: string): Promise<Buffer> {
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) {
    throw Object.assign(new Error('Cloud TTS is not configured'), { code: 'NOT_CONFIGURED' });
  }

  const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode, ssmlGender: 'FEMALE' },
      audioConfig: { audioEncoding: 'MP3' }
    })
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw Object.assign(new Error(`Google Cloud TTS request failed (${response.status}): ${errBody}`), { code: 'UPSTREAM_ERROR' });
  }

  const data = await response.json() as { audioContent?: string };
  if (!data.audioContent) {
    throw Object.assign(new Error('Google Cloud TTS returned no audio content'), { code: 'UPSTREAM_ERROR' });
  }

  return Buffer.from(data.audioContent, 'base64');
}

// POST /api/tts/synthesize  { text: string, lang: 'gu-IN' | 'hi-IN' | 'en-IN' }
// Responds with raw audio/mpeg bytes on success, or a JSON error so the
// client can fall back to the device's own speechSynthesis voice.
router.post('/synthesize', async (req: Request, res: Response) => {
  const { text, lang } = req.body as { text?: unknown; lang?: unknown };

  if (typeof text !== 'string' || !text.trim() || typeof lang !== 'string' || !SUPPORTED_LANGS.has(lang)) {
    return res.status(400).json({ error: 'invalid_request' });
  }

  // Keep requests bounded — this is for short UI announcements and AI
  // replies, not arbitrary document narration.
  const cleanText = text.trim().slice(0, 600);
  const cacheKey = `${lang}::${cleanText}`;

  const cached = audioCache.get(cacheKey);
  if (cached) {
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(cached);
  }

  try {
    const audioBuffer = await synthesizeWithGoogleCloudTts(cleanText, lang);
    cacheSet(cacheKey, audioBuffer);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(audioBuffer);
  } catch (err: any) {
    if (err?.code === 'NOT_CONFIGURED') {
      // Not an error the user needs to see — the client silently falls back
      // to the device voice when it gets this.
      return res.status(503).json({ error: 'cloud_tts_not_configured' });
    }
    console.error('[TTS] synthesize failed:', err?.message || err);
    return res.status(502).json({ error: 'tts_upstream_error' });
  }
});

export default router;
