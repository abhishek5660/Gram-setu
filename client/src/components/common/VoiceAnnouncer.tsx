import { useEffect, useRef } from 'react';
import { useAccessibility, AppLanguage } from '../../context/AccessibilityContext';

// Global, zero-config "click → speak" announcer. Any button, link, or element
// carrying the `cursor-pointer` class is treated as interactive automatically —
// no per-button wiring needed. Elements that already manage their own speech
// (e.g. explicit speak() calls) opt out with `data-voice-skip`, and elements
// that need a specific, richer sentence can set `data-voice="..."` (already
// localized by the caller via t()) to override the generic template entirely.

const OPEN_TEMPLATE: Record<AppLanguage, (label: string) => string> = {
  en: (label) => `You have opened ${label}.`,
  hi: (label) => `आपने ${label} खोला है।`,
  gu: (label) => `તમે ${label} ખોલ્યું છે.`
};

// Buttons whose label already names the action being performed (Submit, Logout, Pay...)
// are announced as-is rather than wrapped in "You have opened ...".
const ACTION_WORDS: Record<AppLanguage, string[]> = {
  en: ['submit', 'save', 'send', 'pay', 'logout', 'login', 'call', 'stop', 'approve', 'delete', 'cancel', 'confirm', 'verify', 'download', 'upload', 'register', 'apply', 'check', 'search'],
  hi: ['सबमिट', 'सहेज', 'भेज', 'भुगतान', 'लॉगआउट', 'लॉगइन', 'फोन', 'रोक', 'स्वीकृत', 'हटाएं', 'रद्द', 'पुष्टि', 'सत्यापित', 'डाउनलोड', 'दर्ज करें', 'जांच', 'खोजें'],
  gu: ['સબમિટ', 'સાચવ', 'મોકલ', 'ચૂકવ', 'લોગઆઉટ', 'લોગિન', 'કૉલ', 'બંધ', 'મંજૂર', 'દૂર', 'રદ', 'પુષ્ટિ', 'ચકાસ', 'ડાઉનલોડ', 'નોંધાવો', 'તપાસ', 'શોધ']
};

const INTERACTIVE_SELECTOR = 'button, a, [role="button"], .cursor-pointer, [data-voice]';
const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}]/gu;
const DEDUPE_WINDOW_MS = 800;
const MAX_LABEL_LENGTH = 70;

function isDisabled(el: HTMLElement): boolean {
  if ((el as HTMLButtonElement).disabled) return true;
  if (el.getAttribute('aria-disabled') === 'true') return true;
  return false;
}

function extractLabel(el: HTMLElement): string {
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();

  // Prefer a heading-like child so a card's title is spoken instead of its
  // whole body (title + subtitle + badges all concatenated).
  const heading = el.querySelector('h1, h2, h3, h4, h5, strong, b');
  const raw = (heading?.textContent || el.textContent || '');
  return raw.replace(EMOJI_REGEX, '').replace(/\s+/g, ' ').trim().slice(0, MAX_LABEL_LENGTH);
}

function isActionLabel(label: string, language: AppLanguage): boolean {
  const lower = label.toLowerCase();
  // Many Hindi/Gujarati labels embed an English word parenthetically
  // (e.g. "आवेदन जमा करें (Submit Application)"), so also check the English list.
  const words = language === 'en' ? ACTION_WORDS.en : [...ACTION_WORDS[language], ...ACTION_WORDS.en];
  return words.some((word) => lower.includes(word.toLowerCase()));
}

function buildAnnouncement(label: string, language: AppLanguage): string {
  if (isActionLabel(label, language)) return label;
  return OPEN_TEMPLATE[language](label);
}

export const VoiceAnnouncer: React.FC = () => {
  const { speak, language } = useAccessibility();

  const speakRef = useRef(speak);
  const languageRef = useRef(language);
  speakRef.current = speak;
  languageRef.current = language;

  const lastRef = useRef<{ text: string; at: number }>({ text: '', at: 0 });

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const node = target.closest(INTERACTIVE_SELECTOR) as HTMLElement | null;
      if (!node) return;
      if (node.closest('[data-voice-skip]')) return;
      if (isDisabled(node)) return;

      const explicit = node.getAttribute('data-voice');
      const message = explicit && explicit.trim()
        ? explicit.trim()
        : buildAnnouncement(extractLabel(node), languageRef.current);

      if (!message) return;

      const now = Date.now();
      if (message === lastRef.current.text && now - lastRef.current.at < DEDUPE_WINDOW_MS) return;
      lastRef.current = { text: message, at: now };

      speakRef.current(message);
    };

    // Capture phase so the announcement fires before (and can be superseded by)
    // any component-specific onClick that calls speak() itself.
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return null;
};
