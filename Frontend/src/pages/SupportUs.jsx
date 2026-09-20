import React, { useState } from "react";
import DonationPaymentModal from "../components/DonationPaymentModal";
import { toast } from "react-toastify";
import {
  HeartIcon,
  SparklesIcon,
  ShieldCheckIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  GlobeAmericasIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

export default function SupportUs() {
  const [selectedCause, setSelectedCause] = useState("treePlantation");
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const causes = [
    {
      key: "treePlantation",
      title: "Urban Miyawaki Afforestation",
      description: "Plant native dense forest patches in congested urban zones to absorb toxic PM2.5 particles.",
      impact: "1 Tree planted & geo-tagged per ₹250",
      emoji: "🌳",
      target: "50,000 Trees",
      current: "34,210",
      progress: 68,
    },
    {
      key: "oceanCleanup",
      title: "River & Coastal Plastic Trapping",
      description: "Deploy solar-powered boom barriers across major river outlets before plastic hits oceans.",
      impact: "10 KG ocean-bound plastic intercepted per ₹500",
      emoji: "🌊",
      target: "100 Tons Plastic",
      current: "76.4 Tons",
      progress: 76,
    },
    {
      key: "collectorWelfare",
      title: "Informal Waste Picker Welfare & Health",
      description: "Provide protective hazmat gear, medical health cards, and micro-insurance to informal ragpickers.",
      impact: "1 Full safety & health kit per ₹1,000",
      emoji: "🦺",
      target: "5,000 Pickers",
      current: "3,890",
      progress: 78,
    },
    {
      key: "schoolRecycling",
      title: "Green School Circularity Labs",
      description: "Install interactive segregation stations and zero-waste composting bins in government schools.",
      impact: "1 School eco-lab enabled per ₹2,500",
      emoji: "🏫",
      target: "200 Schools",
      current: "142",
      progress: 71,
    },
  ];

  const presets = [100, 250, 500, 1000, 2500, 5000];
  const activeCauseObj = causes.find((c) => c.key === selectedCause) || causes[0];

  const handleCustomAmountChange = (e) => {
    const val = e.target.value;
    setCustomAmount(val);

    if (val === "") {
      setAmountError("");
      return;
    }

    const num = Number(val);
    if (isNaN(num) || num < 10) {
      setAmountError("Minimum donation amount is ₹10");
    } else if (num > 1000000) {
      setAmountError("Maximum donation amount is ₹10,00,000 per transaction");
    } else {
      setAmountError("");
    }
  };

  const handleProceedClick = () => {
    const finalVal = customAmount ? Number(customAmount) : selectedAmount;

    if (!finalVal || isNaN(finalVal) || finalVal < 10) {
      setAmountError("Please enter a valid donation amount of at least ₹10");
      toast.error("Donation amount must be at least ₹10");
      return;
    }

    if (finalVal > 1000000) {
      setAmountError("Maximum donation amount is ₹10,00,000 per transaction");
      toast.error("Maximum donation is ₹10,00,000");
      return;
    }

    setAmountError("");
    setShowPaymentModal(true);
  };

  const finalAmount = customAmount ? (Number(customAmount) > 0 ? Number(customAmount) : 0) : selectedAmount;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-28 pb-24 selection:bg-emerald-500 selection:text-white"
      style={{
        background: "linear-gradient(145deg, #020d18 0%, #051a14 30%, #0a1628 60%, #071a1a 100%)",
      }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold backdrop-blur-md">
            <HeartIcon className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>100% Tax Deductible under Section 80G</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Support India's Green Transition 🌍
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Every rupee donated directly funds urban tree planting, informal collector health coverage, and marine plastic interception. Receive instant 80G tax receipts upon verified payment.
          </p>
        </div>

        {/* Cause Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {causes.map((cause) => {
            const isSelected = selectedCause === cause.key;
            return (
              <div
                key={cause.key}
                onClick={() => setSelectedCause(cause.key)}
                className={`p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? "bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/30 shadow-2xl shadow-emerald-500/10"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{cause.emoji}</span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {cause.progress}% Funded
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white">{cause.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{cause.description}</p>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <SparklesIcon className="w-4 h-4 shrink-0" />
                    <span>{cause.impact}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                    <span>Raised: <strong className="text-white">{cause.current}</strong></span>
                    <span>Goal: {cause.target}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${cause.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Donation Amount & Payment Trigger Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-5">
            <div>
              <h3 className="text-xl font-black text-white">Choose Your Contribution Amount</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Funding: <strong className="text-emerald-400">{activeCauseObj.title}</strong>
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              <ShieldCheckIcon className="w-4 h-4" />
              <span>Instant 80G Certificate</span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {presets.map((amt) => {
              const isSelected = selectedAmount === amt && !customAmount;
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(amt);
                    setCustomAmount("");
                    setAmountError("");
                  }}
                  className={`py-3 rounded-2xl text-sm font-black transition-all cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 scale-102"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  }`}
                >
                  ₹{amt}
                </button>
              );
            })}
          </div>

          {/* Custom Amount Input with Live Validation Feedback */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-8 relative">
                <input
                  type="number"
                  min="10"
                  max="1000000"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  placeholder="Or Enter Custom Amount (Min ₹10)"
                  className={`w-full p-4 bg-slate-950 border rounded-2xl text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    amountError
                      ? "border-rose-500 focus:ring-rose-500"
                      : "border-slate-700 focus:ring-emerald-500"
                  }`}
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs font-bold text-slate-400">
                  INR (₹)
                </div>
              </div>

              <div className="sm:col-span-4">
                <button
                  type="button"
                  onClick={handleProceedClick}
                  disabled={Boolean(amountError)}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>Proceed to Donate ₹{finalAmount >= 10 ? finalAmount : 500}</span>
                  <HeartIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {amountError && (
              <p className="text-xs text-rose-400 font-bold flex items-center gap-1.5 pl-1 animate-fade-in">
                <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
                {amountError}
              </p>
            )}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-400">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <ShieldCheckIcon className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-white">80G Income Tax Exemption</p>
              <p className="text-slate-500">Official verified receipt with Govt. Registration ID.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <GlobeAmericasIcon className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-white">Geo-Tagged Tree Certificates</p>
              <p className="text-slate-500">Track exact latitude/longitude of your planted trees.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <DocumentArrowDownIcon className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-white">Zero Administrative Cut</p>
              <p className="text-slate-500">100% of donation goes directly to verified field missions.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Donation Payment Checkout Modal with UPI QR & 80G Certificate */}
      <DonationPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        cause={activeCauseObj}
        amount={finalAmount >= 10 ? finalAmount : 500}
      />
    </div>
  );
}
