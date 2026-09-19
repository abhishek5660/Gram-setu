import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import { BigButton } from '../components/common/BigButton';
import { Phone, ShieldCheck, KeyRound, UserCheck, Heart, Sparkles, Volume2 } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { t, setUser, setToken, speak, isHighContrast } = useAccessibility();
  const navigate = useNavigate();

  const [phone, setPhone] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [rolePreference, setRolePreference] = useState<'CITIZEN' | 'ASSISTED' | 'ADMIN'>('CITIZEN');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError('कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें');
      speak('कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();

      if (res.ok) {
        setStep('OTP');
        setOtp('123456'); // Auto-fill for developer demo convenience
        speak('ओटीपी आपके नंबर पर भेज दिया गया है। डेमो ओटीपी 1 2 3 4 5 6 दर्ज करें।');
      } else {
        setError(data.error || 'ओटीपी भेजने में समस्या आई');
      }
    } catch (err) {
      setError('सर्वर से संपर्क नहीं हो पाया');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError('कृपया ओटीपी दर्ज करें');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otp, rolePreference })
      });
      const data = await res.json();

      if (res.ok) {
        setToken(data.token);
        setUser(data.user);
        speak(`नमस्ते ${data.user.name}! ग्राम सेतु में आपका स्वागत है।`);
        
        if (data.user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/home');
        }
      } else {
        setError(data.error || 'अमान्य ओटीपी');
        speak('गलत ओटीपी! पुनः प्रयास करें');
      }
    } catch (err) {
      setError('सत्यापन विफल रहा');
    } finally {
      setLoading(false);
    }
  };

  // Instant Demo Login Shortcuts
  const handleDemoLogin = async (demoPhone: string, role: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: demoPhone, code: '123456', rolePreference: role })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setUser(data.user);
        speak(`नमस्ते ${data.user.name}! ग्राम सेतु में आपका स्वागत है।`);
        if (data.user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/home');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className={`rounded-3xl p-6 md:p-8 border-4 shadow-2xl ${
        isHighContrast ? 'bg-black border-yellow-400 text-white' : 'bg-white border-saffron-500/40'
      }`}>
        {/* Banner */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-saffron-500 to-amber-600 flex items-center justify-center text-white text-4xl shadow-xl mb-4">
            🌾
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            {t('auth.welcome')}
          </h1>
          <p className="text-base text-slate-600 font-medium">
            {t('auth.tagline')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-100 border-2 border-red-400 text-red-800 text-center font-bold text-base flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => speak(error)} className="p-1 text-red-600">
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 1: Mobile Phone */}
        {step === 'PHONE' && (
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Phone className="w-5 h-5 text-saffron-600" />
                <span>{t('auth.enter_phone')}</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-xl">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder={t('auth.phone_placeholder')}
                  className="w-full pl-16 pr-4 py-4 rounded-2xl border-2 border-slate-300 focus:border-saffron-500 font-bold text-2xl tracking-wider text-slate-900 bg-slate-50 min-h-[60px]"
                />
              </div>
            </div>

            <BigButton
              label={loading ? 'ओटीपी भेजा जा रहा है...' : t('auth.send_otp')}
              onClick={handleSendOtp}
              disabled={loading}
              icon={<ShieldCheck className="w-7 h-7" />}
              variant="primary"
            />
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'OTP' && (
          <div className="space-y-6">
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 text-amber-900 text-sm font-bold flex items-center justify-between">
              <span>{t('auth.demo_hint')}</span>
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>

            <div>
              <label className="block text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-saffron-600" />
                <span>{t('auth.enter_otp')}</span>
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-[0.5em] font-black text-3xl py-4 rounded-2xl border-2 border-saffron-500 bg-slate-50 min-h-[64px]"
              />
            </div>

            <BigButton
              label={loading ? 'सत्यापित हो रहा है...' : t('auth.verify_otp')}
              onClick={handleVerifyOtp}
              disabled={loading}
              variant="secondary"
            />

            <button
              onClick={() => setStep('PHONE')}
              className="w-full text-center text-slate-500 hover:text-saffron-600 font-bold text-sm py-2"
            >
              ← दूसरा नंबर दर्ज करें (Change Phone Number)
            </button>
          </div>
        )}

        <hr className="my-8 border-slate-200" />

        {/* Instant One-Tap Demo Access */}
        <div className="space-y-3">
          <p className="text-center font-bold text-xs uppercase tracking-wider text-slate-500">
            ⚡ त्वरित डेमो टेस्ट (Instant Quick Demo Logins)
          </p>

          <button
            onClick={() => handleDemoLogin('9876543210', 'CITIZEN')}
            className="w-full p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 text-emerald-900 font-bold text-left flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">👵</span>
              <div>
                <div className="font-extrabold text-base">रमेश प्रसाद काका (वरिष्ठ नागरिक - 70 वर्ष)</div>
                <div className="text-xs text-emerald-700">वरिष्ठ नागरिक सुगम मोड + विशाल टाइल्स</div>
              </div>
            </div>
            <UserCheck className="w-5 h-5 text-emerald-600 group-hover:scale-110" />
          </button>

          <button
            onClick={() => handleDemoLogin('9999999999', 'ADMIN')}
            className="w-full p-4 rounded-2xl bg-saffron-50 hover:bg-saffron-100 border-2 border-saffron-300 text-saffron-900 font-bold text-left flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏛️</span>
              <div>
                <div className="font-extrabold text-base">श्री रामेश्वर शर्मा (ग्राम पंचायत सचिव)</div>
                <div className="text-xs text-saffron-700">प्रशासनिक समीक्षा, प्रमाण पत्र जारी करना</div>
              </div>
            </div>
            <UserCheck className="w-5 h-5 text-saffron-600 group-hover:scale-110" />
          </button>
        </div>
      </div>
    </div>
  );
};
