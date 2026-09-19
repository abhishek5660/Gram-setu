import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAccessibility } from '../../context/AccessibilityContext';
import { Type, Eye, Volume2, User, LogOut, HeartHandshake, ShieldCheck, Languages } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    isBadaText,
    toggleBadaText,
    isHighContrast,
    toggleHighContrast,
    isSeniorMode,
    toggleSeniorMode,
    language,
    setLanguage,
    t,
    user,
    logout,
    speak
  } = useAccessibility();

  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-saffron-500/30 shadow-md">
      {/* Top Banner for Government / Village Identity */}
      <div className="bg-gradient-to-r from-saffron-600 via-amber-600 to-govGreen-700 text-white text-xs md:text-sm py-1 px-4 flex justify-between items-center font-medium">
        <div className="flex items-center gap-2">
          <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">
            डिजिटल ग्राम पंचायत
          </span>
          <span className="hidden sm:inline">रामपुर (Rampur Panchayat) • भारत सरकार / राज्य शासन</span>
        </div>

        {/* Quick Accessibility Bar */}
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={() => {
              const next = language === 'hi' ? 'en' : 'hi';
              setLanguage(next);
              speak(next === 'hi' ? 'भाषा हिंदी में बदली गई' : 'Language changed to English');
            }}
            className="flex items-center gap-1 bg-black/20 hover:bg-black/30 px-2 py-0.5 rounded font-bold transition-all text-xs"
            title="भाषा बदलें (Change Language)"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'EN / English' : 'हि / हिंदी'}</span>
          </button>

          {/* Bada Text Toggle Button */}
          <button
            onClick={() => {
              toggleBadaText();
              speak(isBadaText ? 'सामान्य अक्षर मोड' : 'बड़ा अक्षर मोड सक्रिय');
            }}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded font-bold text-xs transition-all ${
              isBadaText ? 'bg-amber-300 text-black ring-2 ring-yellow-400' : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>{isBadaText ? 'बड़ा पाठ (ON)' : 'बड़ा पाठ (A+)'}</span>
          </button>

          {/* High Contrast Toggle */}
          <button
            onClick={() => {
              toggleHighContrast();
              speak(isHighContrast ? 'सामान्य रंग मोड' : 'उच्च कंट्रास्ट मोड सक्रिय');
            }}
            className={`hidden md:flex items-center gap-1 px-2 py-0.5 rounded font-bold text-xs ${
              isHighContrast ? 'bg-yellow-400 text-black' : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isHighContrast ? 'कंट्रास्ट (ON)' : 'कंट्रास्ट'}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-saffron-500 to-amber-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg group-hover:scale-105 transition-transform">
            🌾
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 group-hover:text-saffron-600 transition-colors">
                {t('app_name')}
              </span>
              {isSeniorMode && (
                <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
                  वरिष्ठ मोड
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              {t('app_subtitle')}
            </span>
          </div>
        </Link>

        {/* Action Controls & User Identity */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Senior Mode Quick Button */}
          <button
            onClick={() => {
              toggleSeniorMode();
              speak(!isSeniorMode ? 'वरिष्ठ नागरिक मोड सक्रिय हो गया है' : 'सामान्य मोड');
            }}
            className={`px-3 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-1.5 transition-all border ${
              isSeniorMode 
                ? 'bg-emerald-600 text-white border-emerald-700 shadow' 
                : 'bg-amber-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span className="hidden sm:inline">{isSeniorMode ? 'वरिष्ठ नागरिक (ON)' : 'वरिष्ठ नागरिक मोड'}</span>
          </button>

          {/* User Profile or Login */}
          {user ? (
            <div className="flex items-center gap-2">
              <div 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-300 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-saffron-500 text-white flex items-center justify-center font-bold text-sm">
                  {user.name ? user.name[0] : 'U'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 max-w-[120px] truncate">{user.name}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">{user.role === 'ADMIN' ? 'सचिव (Admin)' : 'ग्रामवासी'}</span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="लॉगआउट"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="bg-saffron-600 hover:bg-saffron-700 text-white font-bold px-4 py-2 rounded-xl text-sm min-h-[48px] shadow flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>लॉगिन करें</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
