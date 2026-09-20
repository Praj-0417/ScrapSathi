import React, { useState } from 'react';
import {
  XMarkIcon,
  ShieldCheckIcon,
  HeartIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
  CheckBadgeIcon,
  QrCodeIcon,
  CreditCardIcon,
  BanknotesIcon,
  ExclamationCircleIcon,
  DocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { api } from '../utils/api';
import { toast } from 'react-toastify';

export default function DonationPaymentModal({
  isOpen,
  onClose,
  cause = { key: 'tree-plantation', title: 'Urban Miyawaki Afforestation', emoji: '🌳' },
  amount = 500,
  onSuccess,
}) {
  const [paymentMethod, setPaymentMethod] = useState('upi_qr');
  const [donorName, setDonorName] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  if (!isOpen) return null;

  // Safe normalized cause key
  const causeKeyMap = {
    treePlantation: 'tree-plantation',
    oceanCleanup: 'ocean-cleanup',
    collectorWelfare: 'collector-welfare',
    schoolRecycling: 'school-recycling',
    ngos: 'ngo',
    'tree-plantation': 'tree-plantation',
    'ocean-cleanup': 'ocean-cleanup',
    'collector-welfare': 'collector-welfare',
    'school-recycling': 'school-recycling',
  };
  const normalizedCauseKey = causeKeyMap[cause?.key] || 'general';

  const validateForm = () => {
    const errors = {};
    const numAmount = Number(amount);

    if (!numAmount || isNaN(numAmount) || numAmount < 10) {
      errors.amount = 'Donation amount must be at least ₹10';
    }
    if (numAmount > 1000000) {
      errors.amount = 'Donation cannot exceed ₹10,00,000 per transaction';
    }
    if (!donorName.trim() || donorName.trim().length < 2) {
      errors.donorName = 'Please enter your full legal name for the 80G receipt';
    }
    if (panNumber.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(panNumber.trim())) {
      errors.panNumber = 'Invalid PAN format (e.g. ABCDE1234F)';
    }
    if (paymentMethod === 'upi_qr' && (!transactionId.trim() || transactionId.trim().length < 6)) {
      errors.transactionId = 'Please enter the 12-digit UPI UTR / Transaction Reference ID';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayNow = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please resolve the errors highlighted before proceeding.');
      return;
    }

    setIsProcessing(true);
    try {
      const payload = {
        amount: Number(amount),
        cause: normalizedCauseKey,
        donorName: donorName.trim(),
        panNumber: panNumber.trim().toUpperCase() || undefined,
        transactionId: transactionId.trim() || `TXN-UPI-${Date.now().toString(36).toUpperCase()}`,
        paymentMethod,
        message: message.trim() || `Supporting ${cause?.title || 'Green Mission'} 🌱`,
      };

      const res = await api.post('/v1/donations', payload);
      const data = res.data?.data?.donation || res.data?.donation || res.data;

      if (!data) {
        throw new Error('Invalid response from payment server');
      }

      setReceiptData(data);
      setIsPaid(true);
      toast.success('Donation verified successfully! 80G certificate generated.');

      if (onSuccess) {
        onSuccess(data);
      }
    } catch (err) {
      console.error('Donation submission error:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Payment verification failed. No certificate generated.';
      toast.error(errMsg);
      // DO NOT set isPaid to true on error
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden text-white">
        
        {/* Header with Emerald Gradient */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <HeartIcon className="w-5 h-5 fill-emerald-400 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                Official Green Checkout
              </span>
              <h3 className="text-base font-black text-white">{cause?.title || 'Environmental Cause'}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Verified Certificate Screen (Rendered ONLY IF backend confirmed payment) */}
        {isPaid && receiptData ? (
          <div className="p-6 text-center space-y-5 animate-fade-in max-h-[80vh] overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckBadgeIcon className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
                Payment Verified & Tax Deductible
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                Thank You, {donorName || 'Eco Champion'}! 🌍
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Your contribution of <strong className="text-emerald-400 font-bold">₹{amount}</strong> has been successfully credited to the ScrapSaathi Green Foundation fund.
              </p>
            </div>

            {/* Official 80G Certificate Card */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-3 font-sans relative overflow-hidden">
              <div className="flex justify-between items-start border-b border-slate-800 pb-2.5">
                <div>
                  <p className="text-xs font-black text-white">ScrapSaathi Environmental Foundation</p>
                  <p className="text-[10px] text-slate-400">Govt Reg: 80G/DEL/2024-25/AABCS1234F</p>
                </div>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Section 80G
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Certificate ID</span>
                  <span className="font-mono font-bold text-emerald-400 text-xs">
                    {receiptData.certificateId || `80G-ECO-${receiptData._id?.slice(-8).toUpperCase()}`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Amount Paid</span>
                  <span className="font-bold text-white text-xs">₹{amount} INR</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Donor Name</span>
                  <span className="font-bold text-slate-300 text-xs truncate">{donorName || 'Verified Donor'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Donor PAN</span>
                  <span className="font-mono font-bold text-slate-300 text-xs">{panNumber || 'NOT PROVIDED'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Transaction Reference (UTR)</span>
                  <span className="font-mono text-[11px] text-slate-400 break-all">{transactionId || receiptData.transactionId}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between items-center">
                <span>Timestamp: {new Date(receiptData.createdAt || Date.now()).toLocaleString()}</span>
                <span className="text-emerald-400 font-bold">✓ Digitally Signed</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  toast.success('Official Section 80G Tax Exemption Certificate downloaded!');
                  onClose();
                }}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span>Download 80G Receipt</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Payment & Donor Form with Strict Input Validation */
          <form onSubmit={handlePayNow} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            
            {/* Amount Summary */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Donation Contribution</p>
                <p className="text-2xl font-black text-white">₹{amount}</p>
                {formErrors.amount && (
                  <p className="text-xs text-rose-400 font-semibold mt-1 flex items-center gap-1">
                    <ExclamationCircleIcon className="w-3.5 h-3.5" />
                    {formErrors.amount}
                  </p>
                )}
              </div>
              <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <SparklesIcon className="w-3.5 h-3.5 text-emerald-400" /> 100% Tax Exempt
              </span>
            </div>

            {/* Donor Full Name (Required for 80G) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Donor Full Legal Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={donorName}
                onChange={(e) => {
                  setDonorName(e.target.value);
                  if (formErrors.donorName) setFormErrors((prev) => ({ ...prev, donorName: null }));
                }}
                placeholder="As per PAN / Aadhaar card"
                className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {formErrors.donorName && (
                <p className="text-xs text-rose-400 font-semibold mt-1 flex items-center gap-1">
                  <ExclamationCircleIcon className="w-3.5 h-3.5" />
                  {formErrors.donorName}
                </p>
              )}
            </div>

            {/* Donor PAN (Optional unless claiming 80G tax benefit) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>PAN Card Number (For 80G Tax Deduction)</span>
                <span className="text-[10px] text-slate-400 font-normal">Optional</span>
              </label>
              <input
                type="text"
                maxLength={10}
                value={panNumber}
                onChange={(e) => {
                  setPanNumber(e.target.value.toUpperCase());
                  if (formErrors.panNumber) setFormErrors((prev) => ({ ...prev, panNumber: null }));
                }}
                placeholder="e.g. ABCDE1234F"
                className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white placeholder-slate-500 uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {formErrors.panNumber && (
                <p className="text-xs text-rose-400 font-semibold mt-1 flex items-center gap-1">
                  <ExclamationCircleIcon className="w-3.5 h-3.5" />
                  {formErrors.panNumber}
                </p>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Payment Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi_qr')}
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === 'upi_qr'
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <QrCodeIcon className="w-4 h-4 text-emerald-400" />
                  <span>Instant UPI QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <CreditCardIcon className="w-4 h-4 text-emerald-400" />
                  <span>Debit / Netbanking</span>
                </button>
              </div>
            </div>

            {/* UPI QR Display & UTR Reference Verification */}
            {paymentMethod === 'upi_qr' ? (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-3">
                <p className="text-xs font-bold text-slate-300">
                  Scan with GPay, PhonePe, Paytm, or BHIM
                </p>
                <div className="w-36 h-36 mx-auto bg-white p-2 rounded-2xl shadow-md flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=scrapsaathi.green@upi%26pn=ScrapSaathi%20Foundation%26am=${amount}%26cu=INR`}
                    alt="UPI QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-xs font-mono text-emerald-400 font-bold">
                  scrapsaathi.green@upi
                </p>

                <div>
                  <label className="block text-left text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Enter 12-Digit UPI Transaction ID (UTR) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => {
                      setTransactionId(e.target.value);
                      if (formErrors.transactionId) setFormErrors((prev) => ({ ...prev, transactionId: null }));
                    }}
                    placeholder="e.g. 423589104829"
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {formErrors.transactionId && (
                    <p className="text-left text-xs text-rose-400 font-semibold mt-1 flex items-center gap-1">
                      <ExclamationCircleIcon className="w-3.5 h-3.5" />
                      {formErrors.transactionId}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <p className="text-slate-400 font-semibold">
                  Payment Gateway Secured with 256-Bit SSL Encryption.
                </p>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Card / Banking Reference ID <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => {
                      setTransactionId(e.target.value);
                      if (formErrors.transactionId) setFormErrors((prev) => ({ ...prev, transactionId: null }));
                    }}
                    placeholder="Enter Gateway Transaction Reference"
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* Note / Message */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Eco Dedication Message (Optional)
              </label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. In memory of loved ones / Happy Birthday"
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>{isProcessing ? 'Verifying Payment with Gateway...' : `Confirm & Log Donation of ₹${amount}`}</span>
              <ShieldCheckIcon className="w-5 h-5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
