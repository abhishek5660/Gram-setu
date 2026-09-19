import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { Check, X, QrCode, FileText, AlertTriangle, Users, Sparkles, Building2 } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user, speak } = useAccessibility();
  const [applications, setApplications] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'APPS' | 'COMPLAINTS' | 'NOTICES'>('APPS');

  useEffect(() => {
    fetch('/api/applications?role=ADMIN')
      .then(res => res.json())
      .then(data => setApplications(data.applications || []))
      .catch(console.error);

    fetch('/api/complaints?role=ADMIN')
      .then(res => res.json())
      .then(data => setComplaints(data.complaints || []))
      .catch(console.error);
  }, []);

  const handleApproveApp = async (id: string) => {
    try {
      const res = await fetch(`/api/applications/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'APPROVED',
          issuedCertUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop'
        })
      });
      if (res.ok) {
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'APPROVED' } : a));
        speak('आवेदन स्वीकृत कर दिया गया है एवं डिजिटल QR कोड प्रमाणपत्र जारी हो गया है।');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-2xl flex items-center justify-between">
        <div>
          <span className="bg-saffron-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            प्रशासनिक नियंत्रण केंद्र
          </span>
          <h1 className="text-3xl font-black mt-2">
            ग्राम पंचायत रामपुर - सचिव डैशबोर्ड
          </h1>
          <p className="text-slate-300 text-sm font-medium mt-1">
            सचिव: श्री रामेश्वर शर्मा • डिजिटल प्रमाणपत्र हस्ताक्षर व सत्यापन
          </p>
        </div>
        <div className="hidden md:flex items-center gap-4 text-center">
          <div className="bg-white/10 px-4 py-2 rounded-2xl">
            <div className="text-2xl font-black text-amber-400">{applications.filter(a => a.status === 'SUBMITTED').length}</div>
            <div className="text-xs font-bold text-slate-300">लंबित आवेदन</div>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-2xl">
            <div className="text-2xl font-black text-rose-400">{complaints.length}</div>
            <div className="text-xs font-bold text-slate-300">कुल शिकायतें</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('APPS')}
          className={`px-6 py-3 rounded-2xl font-bold text-base transition-all ${
            activeTab === 'APPS'
              ? 'bg-saffron-600 text-white shadow-lg'
              : 'bg-white text-slate-700 hover:bg-amber-50'
          }`}
        >
          📜 प्रमाण पत्र आवेदन ({applications.length})
        </button>

        <button
          onClick={() => setActiveTab('COMPLAINTS')}
          className={`px-6 py-3 rounded-2xl font-bold text-base transition-all ${
            activeTab === 'COMPLAINTS'
              ? 'bg-saffron-600 text-white shadow-lg'
              : 'bg-white text-slate-700 hover:bg-amber-50'
          }`}
        >
          💡 शिकायत प्रबंधन ({complaints.length})
        </button>
      </div>

      {/* Applications Table */}
      {activeTab === 'APPS' && (
        <div className="bg-white rounded-3xl border-4 border-slate-200 shadow-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-extrabold text-sm border-b">
                <th className="p-4">ट्रैकिंग ID</th>
                <th className="p-4">आवेदक</th>
                <th className="p-4">सेवा प्रकार</th>
                <th className="p-4">स्थिति (Status)</th>
                <th className="p-4">कार्रवाई (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-sm">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-amber-50/50">
                  <td className="p-4 font-mono font-extrabold text-saffron-700">{app.trackingId}</td>
                  <td className="p-4">{app.user?.name || 'रमेश प्रसाद کاका'}</td>
                  <td className="p-4">{app.serviceName}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${
                      app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    {app.status !== 'APPROVED' ? (
                      <button
                        onClick={() => handleApproveApp(app.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        <span>स्वीकृत करें & QR जारी करें</span>
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                        <QrCode className="w-4 h-4" />
                        QR डिजिटल प्रमाणपत्र जारी
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Complaints List */}
      {activeTab === 'COMPLAINTS' && (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div key={c.id} className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-md flex justify-between items-start">
              <div>
                <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2 py-1 rounded-md">{c.trackingId}</span>
                <h3 className="text-lg font-black text-slate-900 mt-2">{c.categoryHindi}</h3>
                <p className="text-slate-600 font-medium text-sm mt-1">{c.description}</p>
                <div className="text-xs text-slate-500 mt-2 font-bold">आवेदक: {c.user?.name || 'ग्रामवासी'} • आवंटित: {c.assignedTo || 'जल/विद्युत विभाग'}</div>
              </div>
              <span className="bg-sky-100 text-sky-800 text-xs font-extrabold px-3 py-1 rounded-full">{c.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
