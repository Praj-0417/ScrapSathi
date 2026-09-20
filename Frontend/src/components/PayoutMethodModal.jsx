import React, { useState } from 'react';
import { X, Check, Wallet, Smartphone, Banknote, Building, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function PayoutMethodModal({
  isOpen,
  onClose,
  estimatedAmount = 450,
  selectedMethod = 'upi',
  onSelectMethod,
}) {
  const [method, setMethod] = useState(selectedMethod);
  const [upiId, setUpiId] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    confirmAccount: '',
    ifsc: '',
    accountHolder: '',
  });
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (method === 'upi' && !upiId.trim()) {
      alert('Please enter a valid UPI ID (e.g., yourname@oksbi)');
      return;
    }
    if (method === 'bank') {
      if (!bankDetails.accountNumber || bankDetails.accountNumber !== bankDetails.confirmAccount || !bankDetails.ifsc) {
        alert('Please fill valid bank account and matching IFSC details.');
        return;
      }
    }

    if (onSelectMethod) {
      onSelectMethod({
        method,
        details: method === 'upi' ? { upiId } : method === 'bank' ? bankDetails : {},
      });
    }

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  const payoutOptions = [
    {
      id: 'upi',
      title: 'Instant UPI Transfer',
      badge: 'Recommended • Fast (0 mins)',
      description: 'Receive scrap money directly to Google Pay, PhonePe, Paytm, or BHIM',
      icon: Smartphone,
      color: 'emerald',
    },
    {
      id: 'cash',
      title: 'Cash at Doorstep',
      badge: 'Traditional Settlement',
      description: 'Collector pays cash upon weighing scrap on certified digital scale',
      icon: Banknote,
      color: 'amber',
    },
    {
      id: 'bank',
      title: 'Direct Bank Transfer (IMPS)',
      badge: 'High Volume / B2B',
      description: 'Direct NEFT/IMPS transfer to your savings or current account',
      icon: Building,
      color: 'blue',
    },
    {
      id: 'wallet',
      title: 'ScrapSaathi Green Wallet',
      badge: '+5% Green Bonus Points',
      description: 'Store balance in your eco-wallet for recycling perks & tree donations',
      icon: Wallet,
      color: 'purple',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Doorstep Payout
              </span>
            </div>
            <h3 className="text-lg font-black text-white mt-1">Select Scrap Payout Method</h3>
            <p className="text-xs text-slate-300">Choose how you want the collector to pay you</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Estimated Amount Banner */}
        <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-900">Estimated Scrap Value:</span>
          <span className="text-base font-black text-emerald-600">₹{estimatedAmount}</span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 max-h-[68vh] overflow-y-auto">
          {/* Options Grid */}
          <div className="space-y-3">
            {payoutOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = method === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setMethod(opt.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/10'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <h4 className="text-sm font-bold text-slate-900">{opt.title}</h4>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{opt.description}</p>
                  </div>
                  <div className="mt-1">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Conditional Detail Input Fields */}
          {method === 'upi' && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 animate-fade-in">
              <label className="block text-xs font-bold text-slate-700">Enter Your UPI ID (VPA)</label>
              <input
                type="text"
                placeholder="e.g. 9876543210@paytm or yourname@oksbi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 text-xs font-mono text-slate-900 bg-white"
              />
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Collector will trigger instant bank transfer directly to this UPI ID upon weighing.
              </p>
            </div>
          )}

          {method === 'bank' && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Holder Name</label>
                <input
                  type="text"
                  placeholder="Full name as per passbook"
                  value={bankDetails.accountHolder}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Number</label>
                  <input
                    type="password"
                    placeholder="Enter Account No"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Account</label>
                  <input
                    type="text"
                    placeholder="Re-enter Account No"
                    value={bankDetails.confirmAccount}
                    onChange={(e) => setBankDetails({ ...bankDetails, confirmAccount: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC0001234"
                  value={bankDetails.ifsc}
                  onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value.toUpperCase() })}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase bg-white text-slate-900 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          )}

          {method === 'wallet' && (
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-purple-900 text-xs space-y-1 animate-fade-in">
              <p className="font-bold flex items-center gap-1.5 text-purple-950">
                <Sparkles className="w-4 h-4 text-purple-600" />
                5% Extra Green Bonus Credits
              </p>
              <p className="text-purple-800">
                You will receive <strong>₹{(estimatedAmount * 1.05).toFixed(0)}</strong> in your ScrapSaathi Green Wallet.
              </p>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {isSaved ? (
              <>
                <Check className="w-5 h-5 text-white animate-bounce" />
                <span>Payout Method Confirmed!</span>
              </>
            ) : (
              <>
                <span>Confirm & Set Payout Method</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
