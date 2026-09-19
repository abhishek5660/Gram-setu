import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import { Bot, Send, Mic, Volume2, Square, Sparkles, User, ArrowRight } from 'lucide-react';

export const AssistantPage: React.FC = () => {
  const { speak, isSpeaking, stopSpeech, isListening, listen } = useAccessibility();
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const navigate = useNavigate();

  const [messages, setMessages] = useState<any[]>([
    {
      role: 'assistant',
      content: 'नमस्ते! मैं पंचायत मित्र हूँ। मैं आय प्रमाण पत्र, पेंशन, शिकायत और सरकारी योजनाओं में आपकी सहायता कर सकता हूँ। आप क्या करना चाहते हैं?'
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
            speak('आय प्रमाण पत्र फॉर्म खोला जा रहा है।');
            navigate('/certificates?service=income_certificate');
          }, 4000);
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
            <h1 className="text-2xl md:text-3xl font-black text-slate-900">पंचायत मित्र (AI Assistant)</h1>
            <p className="text-sm font-medium text-slate-500">आपकी भाषा में बोलने वाला पंचायत डिजिटल मित्र</p>
          </div>
        </div>

        {isSpeaking && (
          <button
            onClick={stopSpeech}
            className="flex items-center gap-2 bg-red-600 text-white font-bold px-3 py-2 rounded-xl text-xs animate-pulse"
          >
            <Square className="w-4 h-4 fill-white" />
            <span>आवाज रोकें</span>
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
                <button onClick={() => speak(m.content)} className="mt-2 text-xs text-saffron-700 font-bold flex items-center gap-1 hover:underline">
                  <Volume2 className="w-4 h-4" />
                  <span>फिर से सुनें (Read Out)</span>
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
            पंचायत मित्र उत्तर सोच रहा है...
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
          placeholder="बोलें या सवाल लिखें... (उदा: आय प्रमाणपत्र चाहिए)"
          className="flex-1 p-4 rounded-2xl border-2 border-slate-300 font-bold text-lg bg-white"
        />
        <button
          onClick={() => handleSend()}
          className="bg-saffron-600 hover:bg-saffron-700 text-white p-4 rounded-2xl font-bold min-w-[60px] flex items-center justify-center shadow-lg"
        >
          <Send className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
