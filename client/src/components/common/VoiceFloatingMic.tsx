import React, { useState } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { Mic, MicOff, Volume2, Square, Sparkles, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const VoiceFloatingMic: React.FC = () => {
  const {
    isListening,
    listen,
    stopListening,
    isSpeaking,
    stopSpeech,
    speak,
    language,
    voiceTranscript,
    isSeniorMode
  } = useAccessibility();

  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [capturedQuery, setCapturedQuery] = useState<string>('');
  const navigate = useNavigate();

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      setShowVoiceModal(true);
      speak(language === 'hi' ? 'बोलिए! मैं आपकी क्या सहायता कर सकता हूँ?' : 'Please speak! How can I help you today?');
      
      listen((result) => {
        setCapturedQuery(result);
        handleVoiceQuery(result);
      });
    }
  };

  const handleVoiceQuery = (query: string) => {
    const text = query.toLowerCase();

    if (text.includes('income') || text.includes('आय प्रमाणपत्र') || text.includes('आया')) {
      speak('आय प्रमाण पत्र आवेदन पृष्ठ पर ले जाया जा रहा है।');
      setTimeout(() => {
        setShowVoiceModal(false);
        navigate('/certificates?service=income_certificate');
      }, 1500);
      return;
    }

    if (text.includes('complaint') || text.includes('शिकायत') || text.includes('लाइट') || text.includes('पानी')) {
      speak('शिकायत निवारण पृष्ठ खोला जा रहा है।');
      setTimeout(() => {
        setShowVoiceModal(false);
        navigate('/complaints');
      }, 1500);
      return;
    }

    if (text.includes('pension') || text.includes('पेंशन') || text.includes('योजना')) {
      speak('सरकारी योजनाएं एवं पेंशन केंद्र पर ले जाया जा रहा है।');
      setTimeout(() => {
        setShowVoiceModal(false);
        navigate('/schemes');
      }, 1500);
      return;
    }

    if (text.includes('document') || text.includes('आधार') || text.includes('कागज')) {
      speak('दस्तावेज़ लॉकर खोला जा रहा है।');
      setTimeout(() => {
        setShowVoiceModal(false);
        navigate('/documents');
      }, 1500);
      return;
    }

    // Default: Open AI Panchayat Mitra Assistant Chat
    speak(`मैंने सुना: "${query}"। पंचायत मित्र एआई सहायक से सहायता प्राप्त करें।`);
    setTimeout(() => {
      setShowVoiceModal(false);
      navigate(`/assistant?q=${encodeURIComponent(query)}`);
    }, 1800);
  };

  return (
    <>
      {/* Persistent Floating Mic & Audio Stop Bar */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Stop Audio Button when TTS is playing */}
        {isSpeaking && (
          <button
            onClick={stopSpeech}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-full shadow-2xl animate-bounce border-2 border-white"
          >
            <Square className="w-4 h-4 fill-white" />
            <span className="text-sm">आवाज रोकें (Stop)</span>
          </button>
        )}

        {/* Floating Voice Mic Button */}
        <button
          onClick={handleMicClick}
          aria-label="बोलकर सहायता प्राप्त करें (Voice Assistant Mic)"
          className={`relative group min-w-[68px] min-h-[68px] w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 border-4 border-white cursor-pointer ${
            isListening
              ? 'bg-red-600 text-white animate-mic-pulse scale-110'
              : 'bg-gradient-to-r from-saffron-600 to-amber-500 text-white hover:scale-105 shadow-saffron-500/40'
          }`}
        >
          <div className="relative flex items-center justify-center">
            {isListening ? (
              <Mic className="w-8 h-8 md:w-10 md:h-10 animate-pulse" />
            ) : (
              <Mic className="w-8 h-8 md:w-10 md:h-10" />
            )}

            {/* Sparkles Badge */}
            <span className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full text-xs shadow-md">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          
          {/* Label Tooltip */}
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap hidden group-hover:block shadow-lg">
            {isListening ? 'सुन रहा हूँ...' : 'बोलकर कहें (Voice AI)'}
          </span>
        </button>
      </div>

      {/* Voice Recognition Interactive Overlay Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl border-4 border-saffron-500 flex flex-col items-center text-center relative">
            <button
              onClick={() => {
                stopListening();
                setShowVoiceModal(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Big Pulsing Mic Visual */}
            <div className={`w-28 h-28 rounded-full flex items-center justify-center my-4 transition-all ${
              isListening ? 'bg-red-100 text-red-600 animate-mic-pulse ring-8 ring-red-200' : 'bg-saffron-100 text-saffron-600'
            }`}>
              <Mic className="w-14 h-14" />
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
              {isListening ? 'आपकी आवाज सुनी जा रही है...' : 'पंचायत मित्र एआई बोलचाल'}
            </h2>
            <p className="text-slate-600 text-base font-medium mb-4">
              "आय प्रमाण पत्र चाहिए", "लाइट खराब है", या "पेंशन स्टेटस" बोलें
            </p>

            {/* Live Voice Transcript Output */}
            <div className="w-full bg-amber-50 rounded-2xl p-4 border-2 border-amber-200 min-h-[80px] flex items-center justify-center mb-6">
              <p className="text-xl font-bold text-slate-800 italic">
                {voiceTranscript || (isListening ? 'बोलिए, मैं सुन रहा हूँ...' : 'आपका संदेश यहाँ दिखेगा...')}
              </p>
            </div>

            {/* Manual Quick Command Suggestions */}
            <div className="w-full grid grid-cols-2 gap-2 text-left">
              <button
                onClick={() => handleVoiceQuery('आय प्रमाणपत्र चाहिए')}
                className="p-3 rounded-xl bg-slate-100 hover:bg-saffron-50 border border-slate-300 text-xs font-bold text-slate-700 flex items-center justify-between"
              >
                <span>📜 आय प्रमाणपत्र</span>
                <ArrowRight className="w-4 h-4 text-saffron-600" />
              </button>

              <button
                onClick={() => handleVoiceQuery('शिकायत दर्ज करें')}
                className="p-3 rounded-xl bg-slate-100 hover:bg-saffron-50 border border-slate-300 text-xs font-bold text-slate-700 flex items-center justify-between"
              >
                <span>💡 बिजली/पानी शिकायत</span>
                <ArrowRight className="w-4 h-4 text-saffron-600" />
              </button>

              <button
                onClick={() => handleVoiceQuery('पेंशन योजना')}
                className="p-3 rounded-xl bg-slate-100 hover:bg-saffron-50 border border-slate-300 text-xs font-bold text-slate-700 flex items-center justify-between"
              >
                <span>👵 वृद्धावस्था पेंशन</span>
                <ArrowRight className="w-4 h-4 text-saffron-600" />
              </button>

              <button
                onClick={() => handleVoiceQuery('दस्तावेज़ लॉकर')}
                className="p-3 rounded-xl bg-slate-100 hover:bg-saffron-50 border border-slate-300 text-xs font-bold text-slate-700 flex items-center justify-between"
              >
                <span>📁 आधार/कागज पत्र</span>
                <ArrowRight className="w-4 h-4 text-saffron-600" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
