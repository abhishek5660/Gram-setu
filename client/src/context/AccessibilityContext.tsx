import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import hiDict from '../locales/hi.json';
import enDict from '../locales/en.json';
import guDict from '../locales/gu.json';

export type AppLanguage = 'hi' | 'en' | 'gu';

const SPEECH_LANG_MAP: Record<AppLanguage, string> = {
  hi: 'hi-IN',
  en: 'en-IN',
  gu: 'gu-IN'
};

// Not every device ships a Gujarati (or even Hindi) voice at all. When the
// exact language has no installed voice, fall back through this order so the
// user still hears something instead of silence, rather than relying on
// `utterance.lang` alone to pick a voice.
const VOICE_FALLBACK_ORDER: AppLanguage[] = ['gu', 'hi', 'en'];

// --- iOS/WebKit-specific Web Speech API handling ---------------------------
// Every iOS browser (Safari, Chrome-on-iOS, WKWebView) is required by Apple to
// use WebKit's speech engine underneath, and it behaves differently from
// Android Chrome's in ways that matter here:
//  1. speechSynthesis.speak() is frequently ignored until a real user gesture
//     (tap/click) has "unlocked" the speech engine for the page session.
//  2. `onvoiceschanged` does not reliably fire on every iOS version, so a
//     voice list cached once (possibly before iOS finished loading voices)
//     can stay stale/empty for the rest of the session.
//  3. Calling speak() immediately after cancel() can silently drop the new
//     utterance — a long-reported WebKit quirk.
// None of this touches the Android code path, so it can't regress the
// already-working Android Gujarati voice.
function isIOSDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isClassicIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  // iPadOS 13+ reports its platform as "MacIntel" but (unlike a real Mac) has touch points.
  const isModerniPad = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return isClassicIOS || isModerniPad;
}

let speechUnlocked = false;

// iOS requires the speech engine to be "woken up" from inside a genuine user
// gesture before it will produce any audio. Once this silent warm-up
// utterance has played, later speak() calls succeed even from async code
// (e.g. after an API response resolves) for the rest of the page session.
function unlockSpeechSynthesis() {
  if (speechUnlocked || !('speechSynthesis' in window)) return;
  speechUnlocked = true;
  try {
    window.speechSynthesis.getVoices();
    const warmUp = new SpeechSynthesisUtterance(' ');
    warmUp.volume = 0;
    window.speechSynthesis.speak(warmUp);
  } catch {
    // Best-effort only — a real speak() call still gets its own chance to
    // work (and to report a real error via onerror) even if this fails.
  }
}

function findVoiceForLang(langCode: string): SpeechSynthesisVoice | undefined {
  if (!('speechSynthesis' in window)) return undefined;
  // Always read the live list rather than a cache: onvoiceschanged isn't
  // reliable on every iOS version, so a stale cache could permanently miss
  // voices that finished loading later in the session.
  const voices = window.speechSynthesis.getVoices();
  const exact = voices.find((v) => v.lang.toLowerCase() === langCode.toLowerCase());
  if (exact) return exact;
  const prefix = langCode.split('-')[0].toLowerCase();
  return voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
}

function resolveVoice(targetLang: AppLanguage): { voice?: SpeechSynthesisVoice; usedFallback: boolean } {
  const direct = findVoiceForLang(SPEECH_LANG_MAP[targetLang]);
  if (direct) return { voice: direct, usedFallback: false };

  for (const fallbackLang of VOICE_FALLBACK_ORDER) {
    if (fallbackLang === targetLang) continue;
    const fallback = findVoiceForLang(SPEECH_LANG_MAP[fallbackLang]);
    if (fallback) return { voice: fallback, usedFallback: true };
  }
  return { voice: undefined, usedFallback: false };
}

// --- Application-controlled cloud TTS (primarily for Gujarati) -------------
// Device speechSynthesis can't be relied on for Gujarati: iOS ships no gu-IN
// voice unless the user manually installs one, and requiring that is exactly
// what we're avoiding. Instead, Gujarati text is sent to our own backend
// (server/src/routes/tts.routes.ts), which calls a cloud TTS provider that
// actually has a Gujarati voice and returns real audio — a capability of the
// app, not of the device. Device speechSynthesis remains the primary path
// for English/Hindi (already reliable) and is still the final fallback for
// Gujarati if the cloud call fails for any reason (offline, quota, etc).
const cloudAudioUrlCache = new Map<string, string>();

let htmlAudioUnlocked = false;
// A ~0.01s silent WAV — just enough for iOS to treat this as "audio has been
// played from a user gesture," unlocking later programmatic .play() calls
// made from async code (e.g. once a fetched TTS response comes back).
const SILENT_WAV_DATA_URI = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

function unlockHtmlAudio() {
  if (htmlAudioUnlocked || typeof Audio === 'undefined') return;
  htmlAudioUnlocked = true;
  try {
    const el = new Audio(SILENT_WAV_DATA_URI);
    el.volume = 0;
    el.play().catch(() => {
      // Some browsers still refuse this without a "trusted" gesture; a real
      // playback attempt later gets its own chance and its own error handling.
    });
  } catch {
    // Best-effort only.
  }
}

async function fetchCloudAudioUrl(text: string, langCode: string): Promise<string | null> {
  const cacheKey = `${langCode}::${text}`;
  const cached = cloudAudioUrlCache.get(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch('/api/tts/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang: langCode })
    });
    if (!res.ok) return null;

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    cloudAudioUrlCache.set(cacheKey, url);
    return url;
  } catch (err) {
    console.warn('Cloud TTS request failed, falling back to device voice:', err);
    return null;
  }
}

const STT_UNSUPPORTED_MESSAGE: Record<AppLanguage, string> = {
  hi: 'आपके ब्राउज़र में आवाज पहचान सुविधा उपलब्ध नहीं है।',
  en: 'Speech recognition is not supported in this browser.',
  gu: 'તમારા બ્રાઉઝરમાં વૉઇસ ઓળખની સુવિધા ઉપલબ્ધ નથી.'
};

interface UserProfile {
  id: string;
  phone: string;
  name: string;
  age: number;
  village: string;
  ward: string;
  aadhaarMasked?: string;
  role: 'CITIZEN' | 'ASSISTED' | 'ADMIN';
  isSenior: boolean;
}

interface AccessibilityContextType {
  isBadaText: boolean;
  toggleBadaText: () => void;
  isHighContrast: boolean;
  toggleHighContrast: () => void;
  isSeniorMode: boolean;
  toggleSeniorMode: () => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (keyPath: string) => string;
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;
  token: string | null;
  setToken: (t: string | null) => void;
  logout: () => void;
  
  // Voice STT / TTS
  isSpeaking: boolean;
  speak: (text: string, langOverride?: AppLanguage) => void;
  stopSpeech: () => void;
  isListening: boolean;
  listen: (onResultCallback: (text: string) => void) => void;
  stopListening: () => void;
  voiceTranscript: string;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBadaText, setIsBadaText] = useState<boolean>(() => localStorage.getItem('gs_bada_text') === 'true');
  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => localStorage.getItem('gs_high_contrast') === 'true');
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    return (localStorage.getItem('gs_lang') as AppLanguage) || 'hi';
  });
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('gs_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem('gs_token'));

  const [isSeniorMode, setIsSeniorMode] = useState<boolean>(() => {
    if (user?.isSenior || (user?.age && user.age >= 60)) return true;
    return localStorage.getItem('gs_senior_mode') === 'true';
  });

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');

  // Tracks the currently-playing cloud TTS <audio> element (if any) so
  // stopSpeech() can stop it, the same way it cancels device speechSynthesis.
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Kick off async voice-list loading early, and unlock both the device
  // speech engine and HTML5 <audio> playback on the very first real user
  // interaction anywhere on the page — required by iOS before either will
  // produce audio, including for calls made later from async code (e.g.
  // once a chat reply or a cloud TTS fetch resolves).
  useEffect(() => {
    const unlock = () => {
      unlockSpeechSynthesis();
      unlockHtmlAudio();
    };
    if ('speechSynthesis' in window) window.speechSynthesis.getVoices();

    document.addEventListener('touchend', unlock, { once: true, capture: true });
    document.addEventListener('mousedown', unlock, { once: true, capture: true });
    document.addEventListener('keydown', unlock, { once: true, capture: true });
    return () => {
      document.removeEventListener('touchend', unlock, true);
      document.removeEventListener('mousedown', unlock, true);
      document.removeEventListener('keydown', unlock, true);
    };
  }, []);

  // Sync Bada Text class on body
  useEffect(() => {
    if (isBadaText) {
      document.body.classList.add('bada-text');
    } else {
      document.body.classList.remove('bada-text');
    }
    localStorage.setItem('gs_bada_text', String(isBadaText));
  }, [isBadaText]);

  // Sync High Contrast class on body
  useEffect(() => {
    if (isHighContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    localStorage.setItem('gs_high_contrast', String(isHighContrast));
  }, [isHighContrast]);

  // Sync User & Senior mode
  useEffect(() => {
    if (user) {
      localStorage.setItem('gs_user', JSON.stringify(user));
      if (user.isSenior || user.age >= 60) {
        setIsSeniorMode(true);
        setIsBadaText(true);
      }
    } else {
      localStorage.removeItem('gs_user');
    }
  }, [user]);

  const toggleBadaText = () => setIsBadaText(prev => !prev);
  const toggleHighContrast = () => setIsHighContrast(prev => !prev);
  const toggleSeniorMode = () => {
    setIsSeniorMode(prev => {
      const next = !prev;
      localStorage.setItem('gs_senior_mode', String(next));
      if (next) setIsBadaText(true);
      return next;
    });
  };

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('gs_lang', lang);
  };

  const setToken = (t: string | null) => {
    setTokenState(t);
    if (t) {
      localStorage.setItem('gs_token', t);
    } else {
      localStorage.removeItem('gs_token');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('gs_user');
    localStorage.removeItem('gs_token');
  };

  // Translation helper
  const t = (keyPath: string): string => {
    const dict = language === 'hi' ? hiDict : language === 'gu' ? guDict : enDict;
    const parts = keyPath.split('.');
    let current: any = dict;
    for (const p of parts) {
      if (current && current[p] !== undefined) {
        current = current[p];
      } else {
        return keyPath;
      }
    }
    return typeof current === 'string' ? current : keyPath;
  };

  // Device speechSynthesis path — the primary route for English/Hindi (both
  // reliably available on-device already) and the final fallback for
  // Gujarati if the cloud TTS call below fails for any reason.
  const speakViaDevice = (cleanText: string, targetLang: AppLanguage) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    unlockSpeechSynthesis();
    window.speechSynthesis.cancel(); // Stop ongoing speech

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = SPEECH_LANG_MAP[targetLang];

    // Explicitly pick a matching voice instead of relying on `lang` alone —
    // on many devices there is no installed Gujarati (or even Hindi) voice,
    // and browsers often stay silent rather than substituting a default one.
    // Falling back to the closest available Indian-language voice means the
    // user still hears the answer instead of nothing, with no visible nag —
    // this is only reached at all when cloud TTS (see speak() below) has
    // already failed, so it's a quiet last resort, not the main path.
    const { voice, usedFallback } = resolveVoice(targetLang);
    if (voice) {
      utterance.voice = voice;
      if (usedFallback) {
        console.warn(`No ${SPEECH_LANG_MAP[targetLang]} voice installed on this device; using ${voice.lang} voice instead.`);
      }
    } else {
      console.warn(`No text-to-speech voices are available on this device for "${cleanText}".`);
    }

    // Slower rate for Senior Citizens for clear understanding
    utterance.rate = isSeniorMode ? 0.8 : 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e.error);
      setIsSpeaking(false);
    };

    // iOS/WebKit has a documented bug where speak() called immediately after
    // cancel() can silently drop the new utterance. A short delay avoids it
    // without being perceptible; Android/desktop Chrome doesn't need it, so
    // it's scoped to iOS only to avoid changing the already-working path.
    if (isIOSDevice()) {
      window.setTimeout(() => window.speechSynthesis.speak(utterance), 60);
    } else {
      window.speechSynthesis.speak(utterance);
    }
  };

  // Cloud TTS path — plays real audio generated by our own backend instead
  // of depending on a device-installed voice. Returns true if playback
  // actually started, so the caller can fall back to speakViaDevice if not.
  const speakViaCloud = async (cleanText: string, langCode: string): Promise<boolean> => {
    const url = await fetchCloudAudioUrl(cleanText, langCode);
    if (!url) return false;

    try {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      const audio = new Audio(url);
      currentAudioRef.current = audio;
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);
      await audio.play();
      return true;
    } catch (err) {
      console.warn('Cloud TTS playback failed, falling back to device voice:', err);
      return false;
    }
  };

  // Text-To-Speech (TTS)
  // `langOverride` lets a caller that just switched languages (e.g. the language
  // switcher itself) speak in the new language immediately, without waiting for
  // the `language` state update to re-render first.
  //
  // Gujarati is routed through our own cloud TTS backend first (see
  // speakViaCloud / server/src/routes/tts.routes.ts) rather than device
  // speechSynthesis, since that's a capability of this app rather than a
  // capability the user's phone may or may not have installed. English and
  // Hindi keep using the device voice directly, since both are reliably
  // available already; device speechSynthesis is still the silent fallback
  // for Gujarati if the cloud call itself fails (offline, quota, etc).
  const speak = (text: string, langOverride?: AppLanguage) => {
    const targetLang = langOverride || language;
    const cleanText = text.replace(/[*#]/g, '');

    // A tap/click reaching this function is a genuine user gesture — treat it
    // as an unlock opportunity too, in case the page-wide listener hasn't
    // fired yet (e.g. this is the very first interaction on the page).
    unlockSpeechSynthesis();
    unlockHtmlAudio();

    if (targetLang === 'gu') {
      speakViaCloud(cleanText, SPEECH_LANG_MAP.gu).then((played) => {
        if (!played) speakViaDevice(cleanText, targetLang);
      });
      return;
    }

    speakViaDevice(cleanText, targetLang);
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setIsSpeaking(false);
  };

  // Speech-To-Text (STT)
  const listen = (onResultCallback: (text: string) => void) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(STT_UNSUPPORTED_MESSAGE[language]);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = SPEECH_LANG_MAP[language];
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceTranscript('');
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setVoiceTranscript(transcript);
      if (event.results[0].isFinal) {
        onResultCallback(transcript);
        setIsListening(false);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        isBadaText,
        toggleBadaText,
        isHighContrast,
        toggleHighContrast,
        isSeniorMode,
        toggleSeniorMode,
        language,
        setLanguage,
        t,
        user,
        setUser,
        token,
        setToken,
        logout,
        isSpeaking,
        speak,
        stopSpeech,
        isListening,
        listen,
        stopListening,
        voiceTranscript
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
