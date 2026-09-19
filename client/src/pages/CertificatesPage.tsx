import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import { BigButton } from '../components/common/BigButton';
import { FileText, Camera, Upload, CheckCircle2, ArrowRight } from 'lucide-react';

export const CertificatesPage: React.FC = () => {
  const { user, token, speak, isHighContrast } = useAccessibility();
  const [searchParams] = useSearchParams();
  const initialService = searchParams.get('service') || 'income_certificate';

  const [selectedService, setSelectedService] = useState<string>(initialService);
  const [income, setIncome] = useState<string>('96000');
  const [purpose, setPurpose] = useState<string>('वृद्धावस्था पेंशन (Old Age Pension)');
  const [appliedBy, setAppliedBy] = useState<string>('Self');
  const [loading, setLoading] = useState<boolean>(false);
  const [submittedApp, setSubmittedApp] = useState<any>(null);

  const services = [
    { id: 'income_certificate', title: 'आय प्रमाण पत्र (Income Certificate)', icon: '📜' },
    { id: 'birth_certificate', title: 'जन्म प्रमाण पत्र (Birth Certificate)', icon: '👶' },
    { id: 'domicile_certificate', title: 'निवास प्रमाण पत्र (Domicile Certificate)', icon: '🏠' },
    { id: 'caste_certificate', title: 'जाति प्रमाण पत्र (Caste Certificate)', icon: '📑' },
    { id: 'death_certificate', title: 'मृत्यु प्रमाण पत्र (Death Certificate)', icon: '🕊️' },
    { id: 'bpl_certificate', title: 'बीपीएल प्रमाण पत्र (BPL Certificate)', icon: '🌾' },
  ];

  const handleSubmit = async () => {
    if (!user) return alert('कृपया पहले लॉगिन करें');

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
        speak(`आपका आवेदन सफलतापूर्वक जमा हो गया है! ट्रैकिंग आईडी: ${data.trackingId}`);
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
            📜 प्रमाण पत्र आवेदन केंद्र
          </h1>
          <p className="text-slate-600 font-medium text-base mt-1">
            बिना पंचायत कार्यालय जाए, घर बैठे प्रमाण पत्र प्राप्त करें
          </p>
        </div>
      </div>

      {submittedApp ? (
        <div className="bg-emerald-50 border-4 border-emerald-400 rounded-3xl p-8 text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center text-4xl shadow-lg">
            ✓
          </div>
          <h2 className="text-3xl font-black text-emerald-900">आवेदन सफलतापूर्वक जमा हो गया!</h2>
          <p className="text-lg font-bold text-emerald-800">
            आपकी ट्रैकिंग आईडी: <span className="font-mono bg-white px-3 py-1 rounded-xl border border-emerald-300">{submittedApp.trackingId}</span>
          </p>
          <p className="text-sm font-medium text-emerald-700">
            ग्राम पंचायत सचिव 48 घंटे के भीतर आपके आवेदन की समीक्षा करेंगे।
          </p>
          <BigButton
            label="एक और आवेदन करें"
            onClick={() => setSubmittedApp(null)}
            variant="secondary"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Service Selector */}
          <div className="space-y-3">
            <h2 className="font-bold text-lg text-slate-800">1. सेवा चुनें</h2>
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedService(s.id)}
                className={`w-full p-4 rounded-2xl text-left border-2 font-bold transition-all flex items-center gap-3 ${
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
              2. मार्गदर्शन आवेदन फॉर्म ({services.find(s => s.id === selectedService)?.title})
            </h2>

            <div>
              <label className="block font-bold text-slate-800 text-base mb-2">वार्षिक आय (Annual Income ₹)</label>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="w-full p-3.5 rounded-xl border-2 border-slate-300 font-bold text-xl bg-slate-50 min-h-[52px]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 text-base mb-2">आवेदन का कारण / उद्देश्य</label>
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
                  <div className="font-bold text-sm">आधार कार्ड सहेजा गया है (Document Reuse)</div>
                  <div className="text-xs text-amber-800">लॉकर से आधार कार्ड स्वतः जोड़ दिया गया है।</div>
                </div>
              </div>
              <span className="text-xs bg-emerald-600 text-white font-bold px-2 py-1 rounded-md">✓ ऑटो-लिंक</span>
            </div>

            <BigButton
              label={loading ? 'आवेदन जमा हो रहा है...' : 'आवेदन जमा करें (Submit Application)'}
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
