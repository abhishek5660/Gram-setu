import React, { createContext, useContext, useState, useEffect } from 'react';
import hiDict from '../locales/hi.json';
import enDict from '../locales/en.json';

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
  language: 'hi' | 'en';
  setLanguage: (lang: 'hi' | 'en') => void;
  t: (keyPath: string) => string;
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;
  token: string | null;
  setToken: (t: string | null) => void;
  logout: () => void;
  
  // Voice STT / TTS
  isSpeaking: boolean;
  speak: (text: string) => void;
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
  const [language, setLanguageState] = useState<'hi' | 'en'>('hi');
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

  const setLanguage = (lang: 'hi' | 'en') => {
    setLanguageState(lang);
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
    const dict = language === 'hi' ? hiDict : enDict;
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
  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel(); // Stop ongoing speech

    const cleanText = text.replace(/[*#]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    // Slower rate for Senior Citizens for clear understanding
    utterance.rate = isSeniorMode ? 0.8 : 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

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
      alert(language === 'hi' ? 'आपके ब्राउज़र में आवाज पहचान सुविधा उपलब्ध नहीं है।' : 'Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
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
