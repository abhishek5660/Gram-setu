import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { Phone, Calendar, Volume2, ShieldCheck, User, AlertCircle } from 'lucide-react';

export const InfoPage: React.FC = () => {
  const { speak } = useAccessibility();
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/notices')
      .then(res => res.json())
      .then(data => setNotices(data.notices || []))
      .catch(console.error);
  }, []);

  const contacts = [
    { title: 'सरपंच', name: 'श्रीमति मालती देवी', phone: '9876543210', icon: '👑' },
    { title: 'ग्राम पंचायत सचिव', name: 'श्री रामेश्वर शर्मा', phone: '9999999999', icon: '🏛️' },
    { title: 'आशा कार्यकर्ता (ASHA Worker)', name: 'सुनीता देवी', phone: '9123456789', icon: '👩‍⚕️' },
    { title: 'एएनएम स्वास्थ केंद्र', name: 'डॉ. रेखा वर्मा', phone: '9812345678', icon: '🏥' },
    { title: 'ग्राम पुलिस चौकी', name: 'चौकी प्रभारी रामपुर', phone: '112', icon: '🚔' },
    { title: 'आपातकालीन एम्बुलेंस', name: '108 एम्बुलेंस सेवा', phone: '108', icon: '🚑' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900">🏛️ ग्राम पंचायत निर्देशिका एवं सूचनाएं</h1>
        <p className="text-slate-600 font-medium text-base mt-1">
          1-टैप में पंचायत अधिकारियों व आपातकालीन सेवाओं को कॉल करें
        </p>
      </div>

      {/* Contacts Grid */}
      <h2 className="text-2xl font-black text-slate-900 mb-4">📞 1-टैप आपातकालीन संपर्क (Direct Call)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {contacts.map((c, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border-2 border-saffron-200 shadow-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{c.icon}</span>
              <div>
                <div className="font-extrabold text-base text-slate-900">{c.title}</div>
                <div className="text-xs text-slate-500 font-bold">{c.name}</div>
              </div>
            </div>

            <a
              href={`tel:${c.phone}`}
              onClick={() => speak(`${c.title} को फोन मिलाया जा रहा है`)}
              className="bg-govGreen-600 hover:bg-govGreen-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 shadow"
            >
              <Phone className="w-4 h-4" />
              <span>कॉल करें</span>
            </a>
          </div>
        ))}
      </div>

      {/* Notices */}
      <h2 className="text-2xl font-black text-slate-900 mb-4">📢 सार्वजनिक सूचनाएं एवं ग्राम सभा</h2>
      <div className="space-y-4">
        {notices.map((n) => (
          <div key={n.id} className="bg-amber-50 p-6 rounded-3xl border-2 border-amber-300 shadow-md space-y-3">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-black text-amber-950">{n.titleHindi}</h3>
              <button
                onClick={() => speak(`${n.titleHindi}। ${n.contentHindi}`)}
                className="bg-saffron-600 text-white font-bold p-2 rounded-xl text-xs flex items-center gap-1"
              >
                <Volume2 className="w-4 h-4" />
                <span>सुनें</span>
              </button>
            </div>
            <p className="text-amber-900 text-sm font-medium">{n.contentHindi}</p>
            {n.agenda && (
              <div className="p-3 bg-white/80 rounded-2xl text-xs font-bold text-slate-800 whitespace-pre-line">
                📋 <b>ग्राम सभा एजेंडा:</b><br />{n.agenda}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
