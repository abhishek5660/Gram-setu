import { Router, Request, Response } from 'express';

const router = Router();

// Gujarati speech must not depend on the user's device having a Gujarati
// system voice installed (iOS in particular ships none by default). This
// generates real audio server-side instead — a capability of the app, not
// of the device — using Google Translate's public text-to-speech endpoint
// (translate.google.com/translate_tts). This is the same unofficial
// mechanism the widely-used open-source `gTTS` library relies on: no API
// key, no billing account, no signup. It's undocumented and unsupported by
// Google (they could rate-limit or change it without notice), which is the
// trade-off for not requiring any paid credentials; the in-memory cache
// below keeps real request volume to it as low as possible, and the client
// still falls back to the device voice if a request to it ever fails.
const SUPPORTED_LANGS: Record<string, string> = {
  'gu-IN': 'gu',
  'hi-IN': 'hi',
  'en-IN': 'en'
};

// In-memory cache: the vast majority of spoken text in this app is a small,
// repeated set of button/page announcements (see VoiceAnnouncer + the fixed
// voice.* strings) plus a handful of canned AI replies, so caching by exact
// (lang, text) avoids re-requesting the same audio over and over across
// every user's session — both for speed and to minimize load on the
// unofficial endpoint above.
const audioCache = new Map<string, Buffer>();
const MAX_CACHE_ENTRIES = 300;

function cacheSet(key: string, buf: Buffer) {
  if (audioCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = audioCache.keys().next().value;
    if (oldestKey !== undefined) audioCache.delete(oldestKey);
  }
  audioCache.set(key, buf);
}

// The endpoint silently truncates/garbles long input, so long text is split
// into <=200 character chunks (breaking on sentence punctuation or spaces,
// never mid-word) and each chunk is synthesized separately; the resulting
// MP3 buffers are concatenated, which works because they're all encoded
// with the same settings — the same approach gTTS itself uses.
const MAX_CHUNK_LENGTH = 200;

function splitTextIntoChunks(text: string, maxLen: number): string[] {
  const chunks: string[] = [];
  let remaining = text.trim();

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }
    const window = remaining.slice(0, maxLen);
    const lastBreak = Math.max(
      window.lastIndexOf('।'), // Devanagari/Gujarati danda (sentence end)
      window.lastIndexOf('.'),
      window.lastIndexOf('?'),
      window.lastIndexOf('!'),
      window.lastIndexOf(' ')
    );
    const breakPoint = lastBreak > 0 ? lastBreak + 1 : maxLen;
    chunks.push(remaining.slice(0, breakPoint).trim());
    remaining = remaining.slice(breakPoint).trim();
  }

  return chunks.filter(Boolean);
}

async function synthesizeChunk(chunk: string, googleLang: string): Promise<Buffer> {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${googleLang}&client=tw-ob`;

  const response = await fetch(url, {
    headers: {
      // A browser-like User-Agent and Referer are required — Google rejects
      // bare server-to-server requests to this endpoint without them.
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Referer: 'https://translate.google.com/'
    }
  });

  if (!response.ok) {
    throw new Error(`Google Translate TTS request failed (${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function synthesizeWithFreeTts(text: string, langCode: string): Promise<Buffer> {
  const googleLang = SUPPORTED_LANGS[langCode];
  const chunks = splitTextIntoChunks(text, MAX_CHUNK_LENGTH);

  // Sequential, not parallel — this is an unofficial endpoint with no
  // documented rate limit, so we deliberately don't hammer it with bursts.
  const buffers: Buffer[] = [];
  for (const chunk of chunks) {
    buffers.push(await synthesizeChunk(chunk, googleLang));
  }
  return Buffer.concat(buffers);
}

// POST /api/tts/synthesize  { text: string, lang: 'gu-IN' | 'hi-IN' | 'en-IN' }
// Responds with raw audio/mpeg bytes on success, or a JSON error so the
// client can fall back to the device's own speechSynthesis voice.
router.post('/synthesize', async (req: Request, res: Response) => {
  const { text, lang } = req.body as { text?: unknown; lang?: unknown };

  if (typeof text !== 'string' || !text.trim() || typeof lang !== 'string' || !SUPPORTED_LANGS[lang]) {
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
    const audioBuffer = await synthesizeWithFreeTts(cleanText, lang);
    cacheSet(cacheKey, audioBuffer);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(audioBuffer);
  } catch (err: any) {
    console.error('[TTS] synthesize failed:', err?.message || err);
    return res.status(502).json({ error: 'tts_upstream_error' });
  }
});

export default router;
