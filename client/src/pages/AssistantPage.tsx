import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import { Send, Volume2, Square } from 'lucide-react';

export const AssistantPage: React.FC = () => {
  const { speak, isSpeaking, stopSpeech, t } = useAccessibility();
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const navigate = useNavigate();

  const [messages, setMessages] = useState<any[]>([
    {
      role: 'assistant',
      content: t('assistant.initial_greeting')
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (initialQ) {
      handleSend(initialQ);
    }
  }, [initialQ]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const newMsgs = [...messages, { role: 'user', content: text }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs })
      });
      const data = await res.json();
      if (res.ok) {
        const replyMsg = { role: 'assistant', content: data.textHindi || data.textEnglish };
        setMessages([...newMsgs, replyMsg]);
        speak(replyMsg.content);

        if (data.identifiedService === 'income_certificate') {
          setTimeout(() => {
            navigate('/certificates?service=income_certificate');
          }, 3000);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-saffron-500 to-amber-600 text-white flex items-center justify-center text-3xl shadow-lg">
            🤖
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900">{t('assistant.title')}</h1>
            <p className="text-sm font-medium text-slate-500">{t('assistant.subtitle')}</p>
          </div>
        </div>

        {isSpeaking && (
          <button
            onClick={stopSpeech}
            className="flex items-center gap-2 bg-red-600 text-white font-bold px-3 py-2 rounded-xl text-xs animate-pulse cursor-pointer"
          >
            <Square className="w-4 h-4 fill-white" />
            <span>{t('assistant.stop_voice')}</span>
          </button>
        )}
      </div>

      {/* Chat Messages */}
      <div className="bg-white rounded-3xl p-6 border-4 border-saffron-500/30 shadow-xl space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto mb-6">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-10 h-10 rounded-2xl bg-saffron-600 text-white flex items-center justify-center text-lg font-bold shrink-0">
                🤖
              </div>
            )}

            <div className={`max-w-[80%] p-4 rounded-2xl font-bold text-base md:text-lg shadow ${
              m.role === 'user'
                ? 'bg-saffron-600 text-white rounded-tr-none'
                : 'bg-amber-50 text-slate-900 border-2 border-amber-200 rounded-tl-none'
            }`}>
              <p>{m.content}</p>
              {m.role === 'assistant' && (
                <button onClick={() => speak(m.content)} className="mt-2 text-xs text-saffron-700 font-bold flex items-center gap-1 hover:underline cursor-pointer">
                  <Volume2 className="w-4 h-4" />
                  <span>{t('assistant.read_again')}</span>
                </button>
              )}
            </div>

            {m.role === 'user' && (
              <div className="w-10 h-10 rounded-2xl bg-slate-800 text-white flex items-center justify-center text-lg font-bold shrink-0">
                👵
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="p-4 bg-amber-50 rounded-2xl text-amber-900 font-bold animate-pulse">
            {t('assistant.thinking')}
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={t('assistant.placeholder')}
          className="flex-1 p-4 rounded-2xl border-2 border-slate-300 font-bold text-lg bg-white"
        />
        <button
          onClick={() => handleSend()}
          className="bg-saffron-600 hover:bg-saffron-700 text-white p-4 rounded-2xl font-bold min-w-[60px] flex items-center justify-center shadow-lg cursor-pointer"
        >
          <Send className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
