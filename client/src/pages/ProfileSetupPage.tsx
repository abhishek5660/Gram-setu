import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import { BigButton } from '../components/common/BigButton';
import { User, MapPin, Calendar, CreditCard, HeartHandshake, CheckCircle2, Volume2 } from 'lucide-react';

export const ProfileSetupPage: React.FC = () => {
  const { user, setUser, token, t, speak, isHighContrast } = useAccessibility();
  const navigate = useNavigate();

  const [name, setName] = useState<string>(user?.name || '');
  const [age, setAge] = useState<string>(user?.age ? String(user.age) : '30');
  const [village, setVillage] = useState<string>(user?.village || 'ग्राम रामपुर (Rampur)');
  const [ward, setWard] = useState<string>(user?.ward || 'वार्ड 4 (Ward 4)');
  const [aadhaar, setAadhaar] = useState<string>('8921');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const numAge = parseInt(age, 10) || 0;
  const isSenior = numAge >= 60;

  useEffect(() => {
    if (isSenior) {
      speak('आपकी आयु 60 वर्ष से अधिक है! वरिष्ठ नागरिक सुगम मोड स्वतः सक्रिय कर दिया गया है।');
    }
  }, [numAge]);

  const handleSave = async () => {
    if (!name) {
      alert('कृपया अपना नाम दर्ज करें');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          age: numAge,
          village,
          ward,
          aadhaarNumber: aadhaar
        })
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setMessage(data.message || 'प्रोफाइल सहेज ली गई है');
        speak(data.message || 'प्रोफाइल सहेज ली गई है');
        setTimeout(() => navigate('/home'), 1500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className={`rounded-3xl p-6 md:p-8 border-4 shadow-2xl ${
        isHighContrast ? 'bg-black border-yellow-400 text-white' : 'bg-white border-saffron-500/40'
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-saffron-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg">
            👤
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900">
              {t('profile.setup_title')}
            </h1>
            <p className="text-sm font-medium text-slate-500">
              अपनी जानकारी भरें या अद्यतन करें
            </p>
          </div>
        </div>

        {/* Senior Citizen Auto-Detection Banner */}
        {isSenior && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-100 border-2 border-emerald-400 text-emerald-900 font-bold flex items-center gap-3 animate-pulse">
            <HeartHandshake className="w-8 h-8 text-emerald-700 shrink-0" />
            <div className="text-sm md:text-base">
              {t('profile.senior_auto_detected')}
            </div>
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-100 border-2 border-amber-400 text-amber-900 font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-700" />
              {message}
            </span>
            <button onClick={() => speak(message)}>
              <Volume2 className="w-5 h-5 text-amber-700" />
            </button>
          </div>
        )}

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block font-bold text-slate-800 text-lg mb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-saffron-600" />
              <span>{t('profile.name')}</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="उदा: रमेश प्रसाद काका"
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-300 font-bold text-xl text-slate-900 bg-slate-50 min-h-[56px]"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block font-bold text-slate-800 text-lg mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-saffron-600" />
              <span>{t('profile.age')}</span>
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min={18}
              max={110}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-300 font-bold text-xl text-slate-900 bg-slate-50 min-h-[56px]"
            />
          </div>

          {/* Village & Ward */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 text-base mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-saffron-600" />
                <span>{t('profile.village')}</span>
              </label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 font-bold text-slate-900 bg-slate-50 min-h-[52px]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 text-base mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-saffron-600" />
                <span>{t('profile.ward')}</span>
              </label>
              <input
                type="text"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 font-bold text-slate-900 bg-slate-50 min-h-[52px]"
              />
            </div>
          </div>

          {/* Aadhaar Field (Masked display) */}
          <div>
            <label className="block font-bold text-slate-800 text-base mb-2 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-saffron-600" />
              <span>{t('profile.aadhaar')}</span>
            </label>
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 flex items-center justify-between">
              <span className="font-mono font-extrabold text-xl text-amber-900 tracking-wider">
                XXXX-XXXX-{aadhaar.slice(-4) || '8921'}
              </span>
              <span className="text-xs bg-emerald-600 text-white font-bold px-2.5 py-1 rounded-full">
                🔒 सुरक्षित व गोपनीय
              </span>
            </div>
          </div>

          <BigButton
            label={loading ? 'सहेजा जा रहा है...' : t('profile.save')}
            onClick={handleSave}
            disabled={loading}
            variant="primary"
          />
        </div>
      </div>
    </div>
  );
};
