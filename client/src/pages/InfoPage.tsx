import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { Phone, Volume2 } from 'lucide-react';

export const InfoPage: React.FC = () => {
  const { speak, t, language } = useAccessibility();
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/notices')
      .then(res => res.json())
      .then(data => setNotices(data.notices || []))
      .catch(console.error);
  }, []);

  const contacts = [
    { title: t('home.sarpanch'), name: 'Smt. Malti Devi', phone: '9876543210', icon: '👑' },
    { title: t('home.secretary'), name: 'Shri Rameshwar Sharma', phone: '9999999999', icon: '🏛️' },
    { title: 'ASHA Worker', name: 'Sunita Devi', phone: '9123456789', icon: '👩‍⚕️' },
    { title: 'ANM Health Center', name: 'Dr. Rekha Verma', phone: '9812345678', icon: '🏥' },
    { title: 'Village Police Station', name: 'In-charge Rampur', phone: '112', icon: '🚔' },
    { title: 'Emergency Ambulance', name: '108 Ambulance Service', phone: '108', icon: '🚑' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900">{t('info.title')}</h1>
        <p className="text-slate-600 font-medium text-base mt-1">
          {t('info.subtitle')}
        </p>
      </div>

      {/* Contacts Grid */}
      <h2 className="text-2xl font-black text-slate-900 mb-4">{t('info.emergency_title')}</h2>
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
              onClick={() => speak(`Calling ${c.title}`)}
              className="bg-govGreen-600 hover:bg-govGreen-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 shadow"
            >
              <Phone className="w-4 h-4" />
              <span>{t('info.call_button')}</span>
            </a>
          </div>
        ))}
      </div>

      {/* Notices */}
      <h2 className="text-2xl font-black text-slate-900 mb-4">{t('info.notices_title')}</h2>
      <div className="space-y-4">
        {notices.map((n) => {
          const title = language === 'hi' ? n.titleHindi : (n.title || n.titleHindi);
          const content = language === 'hi' ? n.contentHindi : (n.content || n.contentHindi);
          const agenda = language === 'hi' ? (n.agendaHindi || n.agenda) : (n.agenda || n.agendaHindi);

          return (
            <div key={n.id} className="bg-amber-50 p-6 rounded-3xl border-2 border-amber-300 shadow-md space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-black text-amber-950">{title}</h3>
                <button
                  onClick={() => speak(`${title}. ${content}`)}
                  className="bg-saffron-600 text-white font-bold p-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{t('info.listen_button')}</span>
                </button>
              </div>
              <p className="text-amber-900 text-sm font-medium">{content}</p>
              {agenda && (
                <div className="p-3 bg-white/80 rounded-2xl text-xs font-bold text-slate-800 whitespace-pre-line">
                  {t('info.agenda_label')}<br />{agenda}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
