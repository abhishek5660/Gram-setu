import React, { createContext, useContext, useState, useEffect } from 'react';
import hiDict from '../locales/hi.json';
import enDict from '../locales/en.json';
import guDict from '../locales/gu.json';

export type AppLanguage = 'hi' | 'en' | 'gu';

const SPEECH_LANG_MAP: Record<AppLanguage, string> = {
  hi: 'hi-IN',
  en: 'en-IN',
  gu: 'gu-IN'
};

// The browser's voice list loads asynchronously (it's often empty on the very
// first call) and not every device ships a Gujarati voice at all. We cache the
// list once it's ready and, when the exact language has no installed voice,
// fall back through this order so the user still hears something instead of
// silence, rather than relying on `utterance.lang` alone to pick a voice.
let cachedVoices: SpeechSynthesisVoice[] = [];
const VOICE_FALLBACK_ORDER: AppLanguage[] = ['gu', 'hi', 'en'];

function refreshVoiceCache() {
  if ('speechSynthesis' in window) {
    cachedVoices = window.speechSynthesis.getVoices();
  }
}

function findVoiceForLang(langCode: string): SpeechSynthesisVoice | undefined {
  const voices = cachedVoices.length ? cachedVoices : window.speechSynthesis.getVoices();
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

  // Chrome (and most browsers) load the TTS voice list asynchronously, so it's
  // often still empty right after page load. Prime the cache now and keep it
  // fresh via onvoiceschanged, so the very first speak() call already has an
  // accurate list to pick a Gujarati/Hindi/English voice from.
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    refreshVoiceCache();
    window.speechSynthesis.onvoiceschanged = refreshVoiceCache;
    return () => {
      if (window.speechSynthesis.onvoiceschanged === refreshVoiceCache) {
        window.speechSynthesis.onvoiceschanged = null;
      }
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

  // Text-To-Speech (TTS)
  // `langOverride` lets a caller that just switched languages (e.g. the language
  // switcher itself) speak in the new language immediately, without waiting for
  // the `language` state update to re-render first.
  const speak = (text: string, langOverride?: AppLanguage) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel(); // Stop ongoing speech

    const targetLang = langOverride || language;
    const cleanText = text.replace(/[*#]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = SPEECH_LANG_MAP[targetLang];

    // Explicitly pick a matching voice instead of relying on `lang` alone —
    // on many devices (especially Windows/Android Chrome) there is no
    // installed Gujarati voice, and browsers often stay silent rather than
    // substituting a default one. Falling back to the closest available
    // Indian-language voice means the user still hears the answer.
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

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
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
