import React, { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { BigButton } from '../components/common/BigButton';
import { AlertTriangle, Mic, Camera, CheckCircle2, Clock } from 'lucide-react';

export const ComplaintsPage: React.FC = () => {
  const { user, token, speak } = useAccessibility();
  const [description, setDescription] = useState<string>('वार्ड 4 में स्ट्रीट लाइट पिछले 3 दिनों से बंद है।');
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<any>(null);

  const handleSubmit = async () => {
    if (!user) return alert('कृपया लॉगिन करें');

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
        speak(`आपकी शिकायत दर्ज हो गई है! एआई ने इसे स्ट्रीट लाइट विभाग में वर्गीकृत किया है।`);
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
        <h1 className="text-3xl font-black text-slate-900">💡 ग्राम शिकायत निवारण केंद्र</h1>
        <p className="text-slate-600 font-medium text-base mt-1">
          फोटो खींचकर या बोलकर गांव की समस्याएं सीधे पंचायत तक पहुंचाएं
        </p>
      </div>

      {submitted ? (
        <div className="bg-emerald-50 border-4 border-emerald-400 rounded-3xl p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center text-3xl">
            ✓
          </div>
          <h2 className="text-2xl font-black text-emerald-900">आपकी शिकायत सफलता से दर्ज हो गई!</h2>
          <p className="text-base font-bold text-emerald-800">
            शिकायत क्रमांक: <span className="font-mono bg-white px-2 py-1 rounded">{submitted.trackingId}</span>
          </p>
          <div className="p-4 bg-white rounded-2xl text-left border border-emerald-300 font-medium text-sm space-y-1">
            <div>🤖 <b>AI वर्गीकरण:</b> {submitted.categoryHindi}</div>
            <div>🏢 <b>आवंटित विभाग:</b> {submitted.assignedTo || 'ग्राम पंचायत रामपुर'}</div>
          </div>
          <BigButton label="दूसरी शिकायत दर्ज करें" onClick={() => setSubmitted(null)} variant="primary" />
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border-4 border-saffron-500/30 shadow-xl space-y-6">
          <div>
            <label className="block font-bold text-slate-800 text-lg mb-2">अपनी समस्या का विवरण दें (बोलें या लिखें)</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 rounded-2xl border-2 border-slate-300 font-bold text-lg text-slate-900 bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 font-bold text-slate-800 flex items-center justify-center gap-2 hover:bg-amber-100">
              <Camera className="w-6 h-6 text-saffron-600" />
              <span>📷 फोटो खींचें</span>
            </button>

            <button className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 font-bold text-slate-800 flex items-center justify-center gap-2 hover:bg-red-100">
              <Mic className="w-6 h-6 text-red-600" />
              <span>🎙️ आवाज रिकॉर्ड करें</span>
            </button>
          </div>

          <BigButton
            label={loading ? 'शिकायत दर्ज हो रही है...' : 'शिकायत दर्ज करें (Submit Complaint)'}
            onClick={handleSubmit}
            disabled={loading}
            variant="danger"
          />
        </div>
      )}
    </div>
  );
};
