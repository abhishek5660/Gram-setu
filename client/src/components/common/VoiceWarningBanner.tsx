import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';

// Shown when a requested TTS voice (currently checked for Gujarati) isn't
// installed on this device, so the user gets a clear explanation instead of
// silently hearing the wrong voice or nothing at all.
export const VoiceWarningBanner: React.FC = () => {
  const { voiceWarning, dismissVoiceWarning } = useAccessibility();

  if (!voiceWarning) return null;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-1.5rem)] max-w-lg">
      <div
        role="alert"
        data-voice-skip="true"
        className="flex items-start gap-3 bg-amber-50 border-2 border-amber-400 text-amber-900 rounded-2xl shadow-xl p-4"
      >
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="flex-1 text-sm font-bold">{voiceWarning}</p>
        <button
          onClick={dismissVoiceWarning}
          aria-label="Close"
          className="shrink-0 p-1 rounded-lg hover:bg-amber-100 text-amber-700 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
