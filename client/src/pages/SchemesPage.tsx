import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { BigButton } from '../components/common/BigButton';
import { Sparkles } from 'lucide-react';

export const SchemesPage: React.FC = () => {
  const { user, t, speak } = useAccessibility();
  const [schemes, setSchemes] = useState<any[]>([]);
  const [eligibilityResults, setEligibilityResults] = useState<any[]>([]);
  const [checking, setChecking] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/schemes')
      .then(res => res.json())
      .then(data => setSchemes(data.schemes || []))
      .catch(console.error);
  }, []);

  const handleCheckEligibility = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/schemes/check-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: user?.age || 70,
          annualIncome: 96000,
          category: 'GENERAL'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setEligibilityResults(data.results || []);
        speak(`Eligible for ${data.results.length} schemes!`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">{t('schemes.title')}</h1>
          <p className="text-slate-600 font-medium text-base mt-1">
            {t('schemes.subtitle')}
          </p>
        </div>

        <button
          onClick={handleCheckEligibility}
          className="bg-gradient-to-r from-saffron-600 to-amber-600 text-white font-black px-5 py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-amber-200" />
          <span>{checking ? t('schemes.checking') : t('schemes.check_eligibility')}</span>
        </button>
      </div>

      {eligibilityResults.length > 0 && (
        <div className="mb-8 bg-emerald-50 border-4 border-emerald-400 rounded-3xl p-6 space-y-4">
          <h2 className="text-2xl font-black text-emerald-900 flex items-center gap-2">
            <span>{t('schemes.results_title')} ({user?.name || ''})</span>
          </h2>
          {eligibilityResults.map((res, i) => (
            <div key={i} className="p-4 bg-white rounded-2xl border-2 border-emerald-300 font-bold space-y-2">
              <div className="text-lg text-emerald-900 font-black">{res.schemeTitle}</div>
              <p className="text-slate-700 text-sm">{res.reasonHindi}</p>
              <div className="text-xs text-saffron-700 bg-saffron-50 p-2 rounded-xl border border-saffron-200">
                {t('schemes.docs_required')} {res.missingDocs.join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schemes.map((scheme) => (
          <div key={scheme.id} className="bg-white rounded-3xl p-6 border-4 border-saffron-500/30 shadow-xl space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-black text-slate-900">{scheme.titleHindi}</h3>
              <span className="bg-amber-100 text-saffron-800 font-extrabold text-xs px-3 py-1 rounded-full border border-amber-300">
                {scheme.benefitAmount}
              </span>
            </div>
            <p className="text-slate-600 text-sm font-medium">{scheme.descriptionHindi}</p>
            <div className="p-3 bg-slate-50 rounded-2xl text-xs font-bold text-slate-700 space-y-1">
              <div><b>{t('schemes.eligibility_label')}</b> {scheme.eligibilityCriteria}</div>
              <div><b>{t('schemes.docs_required')}</b> {scheme.requiredDocs}</div>
            </div>
            <BigButton label={t('schemes.apply_now')} onClick={() => speak(scheme.titleHindi)} variant="primary" />
          </div>
        ))}
      </div>
    </div>
  );
};
