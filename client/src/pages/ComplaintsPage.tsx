import React, { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { BigButton } from '../components/common/BigButton';
import { Camera, Mic } from 'lucide-react';

export const ComplaintsPage: React.FC = () => {
  const { user, token, t, speak } = useAccessibility();
  const [description, setDescription] = useState<string>(t('complaints.default_text'));
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<any>(null);

  const handleSubmit = async () => {
    if (!user) return alert(t('nav.login'));

    setLoading(true);
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          description,
          photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(data.complaint);
        speak(`${t('complaints.success_title')} ${data.trackingId}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900">{t('complaints.title')}</h1>
        <p className="text-slate-600 font-medium text-base mt-1">
          {t('complaints.subtitle')}
        </p>
      </div>

      {submitted ? (
        <div className="bg-emerald-50 border-4 border-emerald-400 rounded-3xl p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center text-3xl">
            ✓
          </div>
          <h2 className="text-2xl font-black text-emerald-900">{t('complaints.success_title')}</h2>
          <p className="text-base font-bold text-emerald-800">
            {t('complaints.tracking_id')} <span className="font-mono bg-white px-2 py-1 rounded">{submitted.trackingId}</span>
          </p>
          <div className="p-4 bg-white rounded-2xl text-left border border-emerald-300 font-medium text-sm space-y-1">
            <div>{t('complaints.ai_categorization')} {submitted.categoryHindi}</div>
            <div>{t('complaints.assigned_dept')} {submitted.assignedTo || 'Rampur Panchayat'}</div>
          </div>
          <BigButton label={t('complaints.another_complaint')} onClick={() => setSubmitted(null)} variant="primary" />
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border-4 border-saffron-500/30 shadow-xl space-y-6">
          <div>
            <label className="block font-bold text-slate-800 text-lg mb-2">{t('complaints.label')}</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 rounded-2xl border-2 border-slate-300 font-bold text-lg text-slate-900 bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 font-bold text-slate-800 flex items-center justify-center gap-2 hover:bg-amber-100 cursor-pointer">
              <Camera className="w-6 h-6 text-saffron-600" />
              <span>{t('complaints.photo_button')}</span>
            </button>

            <button className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 font-bold text-slate-800 flex items-center justify-center gap-2 hover:bg-red-100 cursor-pointer">
              <Mic className="w-6 h-6 text-red-600" />
              <span>{t('complaints.voice_button')}</span>
            </button>
          </div>

          <BigButton
            label={loading ? t('complaints.submitting') : t('complaints.submit')}
            onClick={handleSubmit}
            disabled={loading}
            variant="danger"
          />
        </div>
      )}
    </div>
  );
};
