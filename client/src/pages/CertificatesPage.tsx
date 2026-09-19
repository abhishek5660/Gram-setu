import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import { BigButton } from '../components/common/BigButton';
import { FileText, Camera, Upload, CheckCircle2, ArrowRight } from 'lucide-react';

export const CertificatesPage: React.FC = () => {
  const { user, token, t, speak, isHighContrast } = useAccessibility();
  const [searchParams] = useSearchParams();
  const initialService = searchParams.get('service') || 'income_certificate';

  const [selectedService, setSelectedService] = useState<string>(initialService);
  const [income, setIncome] = useState<string>('96000');
  const [purpose, setPurpose] = useState<string>(t('certificates.purpose_default'));
  const [appliedBy, setAppliedBy] = useState<string>('Self');
  const [loading, setLoading] = useState<boolean>(false);
  const [submittedApp, setSubmittedApp] = useState<any>(null);

  const services = [
    { id: 'income_certificate', title: t('certificates.services.income_certificate'), icon: '📜' },
    { id: 'birth_certificate', title: t('certificates.services.birth_certificate'), icon: '👶' },
    { id: 'domicile_certificate', title: t('certificates.services.domicile_certificate'), icon: '🏠' },
    { id: 'caste_certificate', title: t('certificates.services.caste_certificate'), icon: '📑' },
    { id: 'death_certificate', title: t('certificates.services.death_certificate'), icon: '🕊️' },
    { id: 'bpl_certificate', title: t('certificates.services.bpl_certificate'), icon: '🌾' },
  ];

  const handleSubmit = async () => {
    if (!user) return alert(t('nav.login'));

    setLoading(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          serviceType: selectedService,
          serviceName: services.find(s => s.id === selectedService)?.title || selectedService,
          formData: { annualIncome: income, purpose },
          appliedBy
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSubmittedApp(data.application);
        speak(`${t('certificates.success_title')} ${data.trackingId}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            {t('certificates.title')}
          </h1>
          <p className="text-slate-600 font-medium text-base mt-1">
            {t('certificates.subtitle')}
          </p>
        </div>
      </div>

      {submittedApp ? (
        <div className="bg-emerald-50 border-4 border-emerald-400 rounded-3xl p-8 text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center text-4xl shadow-lg">
            ✓
          </div>
          <h2 className="text-3xl font-black text-emerald-900">{t('certificates.success_title')}</h2>
          <p className="text-lg font-bold text-emerald-800">
            {t('certificates.tracking_id')} <span className="font-mono bg-white px-3 py-1 rounded-xl border border-emerald-300">{submittedApp.trackingId}</span>
          </p>
          <p className="text-sm font-medium text-emerald-700">
            {t('certificates.success_sub')}
          </p>
          <BigButton
            label={t('certificates.apply_another')}
            onClick={() => setSubmittedApp(null)}
            variant="secondary"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Service Selector */}
          <div className="space-y-3">
            <h2 className="font-bold text-lg text-slate-800">{t('certificates.step1')}</h2>
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedService(s.id)}
                className={`w-full p-4 rounded-2xl text-left border-2 font-bold transition-all flex items-center gap-3 cursor-pointer ${
                  selectedService === s.id
                    ? 'bg-saffron-600 text-white border-saffron-700 shadow-lg scale-102'
                    : 'bg-white text-slate-800 border-slate-200 hover:bg-amber-50'
                }`}
              >
                <span className="text-2xl">{s.icon}</span>
                <span className="text-sm md:text-base">{s.title}</span>
              </button>
            ))}
          </div>

          {/* Application Form */}
          <div className="md:col-span-2 bg-white rounded-3xl p-6 border-4 border-saffron-500/30 shadow-xl space-y-6">
            <h2 className="text-xl font-black text-slate-900 border-b pb-3">
              {t('certificates.step2')} ({services.find(s => s.id === selectedService)?.title})
            </h2>

            <div>
              <label className="block font-bold text-slate-800 text-base mb-2">{t('certificates.income')}</label>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="w-full p-3.5 rounded-xl border-2 border-slate-300 font-bold text-xl bg-slate-50 min-h-[52px]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 text-base mb-2">{t('certificates.purpose')}</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full p-3.5 rounded-xl border-2 border-slate-300 font-bold text-lg bg-slate-50 min-h-[52px]"
              />
            </div>

            {/* Document Upload Hint */}
            <div className="p-4 bg-amber-50 rounded-2xl border-2 border-dashed border-amber-300 text-amber-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Camera className="w-8 h-8 text-saffron-600" />
                <div>
                  <div className="font-bold text-sm">Aadhaar Card linked</div>
                  <div className="text-xs text-amber-800">{t('certificates.auto_link')}</div>
                </div>
              </div>
              <span className="text-xs bg-emerald-600 text-white font-bold px-2 py-1 rounded-md">✓ Auto-Link</span>
            </div>

            <BigButton
              label={loading ? t('certificates.submitting') : t('certificates.submit')}
              onClick={handleSubmit}
              disabled={loading}
              variant="primary"
            />
          </div>
        </div>
      )}
    </div>
  );
};
