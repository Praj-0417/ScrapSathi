import React, { useState } from 'react';
import {
  XMarkIcon,
  HeartIcon,
  CheckBadgeIcon,
  QrCodeIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

// ── Replace this with your real UPI ID ──────────────────────────
const SCRAPSAATHI_UPI_ID = 'scrapsaathi@upi';
const SCRAPSAATHI_UPI_NAME = 'ScrapSaathi Green';
// ────────────────────────────────────────────────────────────────

export default function DonationPaymentModal({
  isOpen,
  onClose,
  cause = { key: 'tree-plantation', title: 'Urban Miyawaki Afforestation', emoji: '🌳' },
  amount = 500,
}) {
  const [copied, setCopied] = useState(false);
  const [markedDone, setMarkedDone] = useState(false);

  if (!isOpen) return null;

  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(SCRAPSAATHI_UPI_ID)}&pn=${encodeURIComponent(SCRAPSAATHI_UPI_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Donation - ${cause.title}`)}`;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiDeepLink)}`;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(SCRAPSAATHI_UPI_ID).then(() => {
      setCopied(true);
      toast.success('UPI ID copied! Open any UPI app and paste to pay.');
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleOpenUPI = () => {
    window.location.href = upiDeepLink;
  };

  if (markedDone) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <div className="relative w-full max-w-sm bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden text-white p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckBadgeIcon className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Thank You! 🌍</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Your support for <strong className="text-emerald-400">{cause.title}</strong> means the world to us. Every rupee creates real impact on the ground.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-slate-300 leading-relaxed">
            <p>💚 We've received thousands of donations and every single one funds real missions — tree planting, ragpicker health kits, plastic boom barriers.</p>
          </div>
          <button
            type="button"
            onClick={() => { setMarkedDone(false); onClose(); }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm cursor-pointer"
          >
            Close & Keep Supporting 🌿
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden text-white">

        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <HeartIcon className="w-5 h-5 fill-emerald-400 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Donate via UPI</span>
              <h3 className="text-sm font-black text-white">{cause.emoji} {cause.title}</h3>
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

        <div className="p-6 space-y-5">

          {/* Amount */}
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Donation Amount</p>
              <p className="text-3xl font-black text-white">₹{amount}</p>
            </div>
            <div className="text-right text-xs text-slate-400">
              <p className="text-emerald-300 font-bold text-sm">{cause.emoji}</p>
              <p>{cause.title.split(' ').slice(0, 2).join(' ')}</p>
            </div>
          </div>

          {/* QR Code */}
          <div className="text-center space-y-3">
            <p className="text-xs font-bold text-slate-300">
              Scan with GPay, PhonePe, Paytm, BHIM, or any UPI app
            </p>
            <div className="w-44 h-44 mx-auto bg-white p-2.5 rounded-2xl shadow-lg flex items-center justify-center">
              <img
                src={qrUrl}
                alt="UPI QR Code for donation"
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback if QR fails */}
              <div className="w-full h-full hidden items-center justify-center text-slate-400 flex-col gap-2">
                <QrCodeIcon className="w-8 h-8" />
                <p className="text-xs text-center">QR unavailable.<br/>Use UPI ID below.</p>
              </div>
            </div>
          </div>

          {/* UPI ID Copy Box */}
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-slate-800 border border-slate-700">
            <p className="flex-1 font-mono text-sm font-bold text-emerald-300">{SCRAPSAATHI_UPI_ID}</p>
            <button
              type="button"
              onClick={handleCopyUPI}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600'
              }`}
            >
              <ClipboardDocumentIcon className="w-3.5 h-3.5" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Open in UPI App (mobile) */}
          <button
            type="button"
            onClick={handleOpenUPI}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <HeartIcon className="w-5 h-5" />
            Open UPI App to Pay ₹{amount}
          </button>

          {/* Mark as paid */}
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-2">Already sent the payment?</p>
            <button
              type="button"
              onClick={() => setMarkedDone(true)}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors cursor-pointer"
            >
              Yes, I've donated! Show thank you ✓
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
