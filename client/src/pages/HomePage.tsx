import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import {
  FileText,
  AlertTriangle,
  Award,
  FolderLock,
  Building2,
  Bot,
  HeartHandshake,
  Sparkles,
  PhoneCall,
  CalendarCheck,
  CreditCard,
  Volume2
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user, isSeniorMode, t, speak, isHighContrast } = useAccessibility();
  const navigate = useNavigate();

  const handleTileClick = (path: string, spokenText: string) => {
    speak(spokenText);
    navigate(path);
  };

  // Senior Mode Simplified 6 Big Tiles
  const seniorTiles = [
    {
      id: 'cert',
      icon: '📜',
      title: 'प्रमाण पत्र आवेदन',
      subTitle: 'आय, जन्म, निवास, जाति प्रमाण पत्र',
      color: 'from-amber-500 to-saffron-600',
      path: '/certificates',
      speech: 'प्रमाण पत्र आवेदन पृष्ठ'
    },
    {
      id: 'complaint',
      icon: '💡',
      title: 'शिकायत दर्ज करें',
      subTitle: 'लाइट, पानी, नल, रास्ता शिकायत',
      color: 'from-red-500 to-rose-600',
      path: '/complaints',
      speech: 'शिकायत दर्ज करने का पृष्ठ'
    },
    {
      id: 'schemes',
      icon: '👵',
      title: 'वृद्धावस्था व योजनाएं',
      subTitle: 'पेंशन स्टेटस, आयुष्मान भारत कार्ड',
      color: 'from-emerald-500 to-govGreen-700',
      path: '/schemes',
      speech: 'वृद्धावस्था पेंशन और सरकारी योजनाएं'
    },
    {
      id: 'docs',
      icon: '📁',
      title: 'दस्तावेज़ लॉकर',
      subTitle: 'सहेजे गए आधार व प्रमाण पत्र',
      color: 'from-sky-500 to-panchayatBlue-700',
      path: '/documents',
      speech: 'आपका दस्तावेज़ लॉकर'
    },
    {
      id: 'panchayat',
      icon: '🏛️',
      title: 'पंचायत फोन निर्देशिका',
      subTitle: 'सरपंच, सचिव, आशा दीदी फोन नंबर',
      color: 'from-purple-600 to-indigo-700',
      path: '/info',
      speech: 'पंचायत संपर्क निर्देशिका'
    },
    {
      id: 'ai',
      icon: '🤖',
      title: 'पंचायत मित्र AI',
      subTitle: 'बोलकर सवाल पूछें व फॉर्म भरवाएं',
      color: 'from-saffron-600 to-amber-700',
      path: '/assistant',
      speech: 'पंचायत मित्र एआई आवाज सहायक'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Welcome Banner */}
      <div className={`mb-8 p-6 rounded-3xl border-4 shadow-xl ${
        isHighContrast 
          ? 'bg-black border-yellow-400 text-white' 
          : 'bg-gradient-to-r from-saffron-600 via-amber-600 to-govGreen-700 text-white'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border border-white/30">
              👵
            </div>
            <div>
              <div className="text-amber-200 font-extrabold text-sm tracking-wider uppercase flex items-center gap-2">
                <span>{t('home.greeting')}</span>
                <button 
                  onClick={() => speak(`राम-राम ${user?.name || 'ग्रामवासी'}! ग्राम पंचायत रामपुर में आपका स्वागत है।`)}
                  className="p-1 hover:bg-white/20 rounded-full"
                >
                  <Volume2 className="w-4 h-4 text-white" />
                </button>
              </div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight">
                {user?.name || 'रमेश प्रसाद काका'}
              </h1>
              <p className="text-white/90 text-sm md:text-base font-medium mt-1">
                ग्राम रामपुर • वार्ड 4 • मोबाइल सं: {user?.phone || '9876543210'}
              </p>
            </div>
          </div>

          {/* Senior Mode Badge */}
          {isSeniorMode && (
            <div className="bg-white/95 text-slate-900 px-4 py-2.5 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg border-2 border-amber-300">
              <HeartHandshake className="w-5 h-5 text-emerald-600" />
              <span>{t('home.senior_banner')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Senior Mode 6 Big Tiles View */}
      {isSeniorMode ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <span>🌾 मुख्य सुगम सेवाएं (6 बड़े बटन)</span>
            </h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-300">
              1-टैप आसान पहुंच
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {seniorTiles.map((tile) => (
              <button
                key={tile.id}
                onClick={() => handleTileClick(tile.path, tile.speech)}
                className={`group relative overflow-hidden p-6 rounded-3xl text-left transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl active:scale-95 border-4 cursor-pointer min-h-[140px] flex items-center justify-between ${
                  isHighContrast
                    ? 'bg-black border-yellow-400 text-yellow-300 hover:bg-zinc-900'
                    : 'bg-white border-saffron-500/30 hover:border-saffron-500 shadow-xl'
                }`}
              >
                <div className="flex items-center gap-5 z-10">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tile.color} text-white flex items-center justify-center text-3xl shadow-lg shrink-0 group-hover:scale-110 transition-transform`}>
                    {tile.icon}
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-saffron-600 transition-colors">
                      {tile.title}
                    </h3>
                    <p className="text-sm font-bold text-slate-500 mt-1">
                      {tile.subTitle}
                    </p>
                  </div>
                </div>

                <span className="text-2xl text-slate-300 group-hover:text-saffron-600 group-hover:translate-x-1 transition-all z-10">
                  ➔
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Standard View for Villagers / Assisted Mode */
        <div className="space-y-8">
          {/* Quick Action Grid */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-saffron-600" />
              <span>ग्राम पंचायत रामपुर सेवाएं</span>
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/certificates')}
                className="p-5 rounded-2xl bg-white border-2 border-saffron-200 hover:border-saffron-500 shadow-md hover:shadow-xl transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-saffron-700 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                  📜
                </div>
                <h3 className="font-extrabold text-lg text-slate-900">प्रमाण पत्र</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">आय, जाति, निवास आवेदन</p>
              </button>

              <button
                onClick={() => navigate('/complaints')}
                className="p-5 rounded-2xl bg-white border-2 border-red-200 hover:border-red-500 shadow-md hover:shadow-xl transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                  💡
                </div>
                <h3 className="font-extrabold text-lg text-slate-900">शिकायत निवारण</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">लाइट, पानी, सड़क मरम्मत</p>
              </button>

              <button
                onClick={() => navigate('/schemes')}
                className="p-5 rounded-2xl bg-white border-2 border-emerald-200 hover:border-emerald-500 shadow-md hover:shadow-xl transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                  👵
                </div>
                <h3 className="font-extrabold text-lg text-slate-900">योजनाएं व पेंशन</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">वृद्धावस्था, आयुष्मान कार्ड</p>
              </button>

              <button
                onClick={() => navigate('/documents')}
                className="p-5 rounded-2xl bg-white border-2 border-sky-200 hover:border-sky-500 shadow-md hover:shadow-xl transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                  📁
                </div>
                <h3 className="font-extrabold text-lg text-slate-900">दस्तावेज़ लॉकर</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">सहेजे गए आधार व राशन कार्ड</p>
              </button>
            </div>
          </div>

          {/* Quick Notice Board & Emergency Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-amber-50 rounded-3xl border-2 border-amber-300">
              <h3 className="font-black text-xl text-amber-900 mb-3 flex items-center gap-2">
                <CalendarCheck className="w-6 h-6 text-saffron-600" />
                <span>आगामी ग्राम सभा बैठक</span>
              </h3>
              <p className="text-sm font-bold text-amber-800 mb-2">
                📅 25 सितंबर 2026, प्रातः 10:00 बजे (पंचायत भवन)
              </p>
              <p className="text-xs text-amber-900/80 font-medium">
                एजेंडा: पेयजल पाइपलाइन विस्तार, पेंशन सत्यापन एवं स्वच्छता बजट।
              </p>
            </div>

            <div className="p-6 bg-emerald-50 rounded-3xl border-2 border-emerald-300">
              <h3 className="font-black text-xl text-emerald-900 mb-3 flex items-center gap-2">
                <PhoneCall className="w-6 h-6 text-emerald-600" />
                <span>आपातकालीन पंचायत संपर्क</span>
              </h3>
              <div className="space-y-2 text-sm font-bold text-emerald-800">
                <div className="flex justify-between items-center">
                  <span>सरपंच श्रीमति मालती देवी</span>
                  <a href="tel:9876543210" className="bg-emerald-600 text-white px-3 py-1 rounded-xl text-xs">📞 फोन करें</a>
                </div>
                <div className="flex justify-between items-center">
                  <span>पंचायत सचिव श्री रामेश्वर शर्मा</span>
                  <a href="tel:9999999999" className="bg-emerald-600 text-white px-3 py-1 rounded-xl text-xs">📞 फोन करें</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
