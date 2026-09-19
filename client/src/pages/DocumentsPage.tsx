import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { BigButton } from '../components/common/BigButton';
import { FolderLock, Download, Upload, ShieldCheck, Eye } from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const { user, speak } = useAccessibility();
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/documents/${user.id}`)
        .then(res => res.json())
        .then(data => setDocuments(data.documents || []))
        .catch(console.error);
    }
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">📁 सुरक्षित दस्तावेज़ लॉकर</h1>
          <p className="text-slate-600 font-medium text-base mt-1">
            एक बार अपलोड करें, भविष्य के सभी आवेदनों में फिर से इस्तेमाल करें
          </p>
        </div>

        <button className="bg-saffron-600 hover:bg-saffron-700 text-white font-bold px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2">
          <Upload className="w-5 h-5" />
          <span>नया दस्तावेज़ जोड़ें</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white rounded-3xl p-6 border-4 border-saffron-500/30 shadow-xl space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-saffron-700 flex items-center justify-center text-2xl font-bold">
                📄
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">{doc.name}</h3>
                <p className="text-xs text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>सत्यापित & गुप्त (Encrypted)</span>
                </p>
              </div>
            </div>

            <img
              src={doc.fileUrl}
              alt={doc.name}
              className="w-full h-40 object-cover rounded-2xl border-2 border-slate-200"
            />

            <div className="flex gap-2">
              <button 
                onClick={() => window.open(doc.fileUrl, '_blank')}
                className="flex-1 py-3 bg-amber-50 hover:bg-amber-100 text-saffron-800 font-bold rounded-xl border border-amber-300 flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span>देखें (View)</span>
              </button>
              <button 
                onClick={() => speak(`${doc.name} डाउनलोड हो रहा है`)}
                className="flex-1 py-3 bg-govGreen-600 text-white font-bold rounded-xl hover:bg-govGreen-700 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>PDF (Download)</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
