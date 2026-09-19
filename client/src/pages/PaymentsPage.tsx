import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { BigButton } from '../components/common/BigButton';
import { CreditCard, CheckCircle2, Receipt, ArrowRight } from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const { user, speak } = useAccessibility();
  const [payments, setPayments] = useState<any[]>([]);
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/payments/${user.id}`)
        .then(res => res.json())
        .then(data => setPayments(data.payments || []))
        .catch(console.error);
    }
  }, [user]);

  const handlePay = async (id: string, amount: number) => {
    setPayingId(id);
    try {
      const res = await fetch(`/api/payments/${id}/pay`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'PAID', receiptId: data.payment.receiptId } : p));
        speak(`₹${amount} का भुगतान सफल रहा! डिजिटल रसीद जारी कर दी गई है।`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900">💳 पंचायत टैक्स एवं जल शुल्क ऑनलाइन भुगतान</h1>
        <p className="text-slate-600 font-medium text-base mt-1">
          घर बैठे संपत्ति कर एवं पेयजल बिल का भुगतान करें व रसीद प्राप्त करें
        </p>
      </div>

      <div className="space-y-4">
        {payments.map((p) => (
          <div key={p.id} className="bg-white p-6 rounded-3xl border-4 border-saffron-500/30 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className={`text-xs font-black px-3 py-1 rounded-full ${
                p.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {p.status === 'PAID' ? '✓ भुगतान सफल (Paid)' : '⏳ शुल्क देय (Pending)'}
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">{p.titleHindi}</h3>
              <div className="text-2xl font-black text-saffron-700 mt-1">₹{p.amount}</div>
              {p.receiptId && (
                <div className="text-xs font-mono font-bold text-slate-500 mt-1">
                  डिजिटल रसीद सं: {p.receiptId}
                </div>
              )}
            </div>

            {p.status === 'PENDING' ? (
              <button
                onClick={() => handlePay(p.id, p.amount)}
                disabled={payingId === p.id}
                className="bg-govGreen-600 hover:bg-govGreen-700 text-white font-black px-6 py-3.5 rounded-2xl shadow-lg flex items-center gap-2 text-base shrink-0"
              >
                <CreditCard className="w-5 h-5" />
                <span>{payingId === p.id ? 'प्रक्रिया जारी...' : 'अभी भुगतान करें (Pay Now)'}</span>
              </button>
            ) : (
              <div className="bg-emerald-50 text-emerald-800 font-extrabold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 border border-emerald-300">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>डिजिटल रसीद उपलब्ध</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
