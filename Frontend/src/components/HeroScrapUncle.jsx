import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  SparklesIcon,
  ShieldCheckIcon,
  ScaleIcon,
  BoltIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const CYCLING_WORDS = ["best market rates", "highest prices", "instant payout", "fair & transparent"];

export default function HeroScrapUncle() {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState("");
  const [selectedCity, setSelectedCity] = useState("delhi-ncr");
  const [wordIdx, setWordIdx] = useState(0);
  const [wordVisible, setWordVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordVisible(false);
      setTimeout(() => {
        setWordIdx((i) => (i + 1) % CYCLING_WORDS.length);
        setWordVisible(true);
      }, 350);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const handleQuickBook = (e) => {
    e.preventDefault();
    if (mobileNumber.trim().length >= 10) {
      sessionStorage.setItem("scrapsaathi_quick_mobile", mobileNumber.trim());
      sessionStorage.setItem("scrapsaathi_selected_city", selectedCity);
    }
    navigate("/sellWaste");
  };

  return (
    <div className="relative overflow-hidden text-white" style={{
      background: "linear-gradient(145deg, #020d18 0%, #051a14 30%, #0a1628 60%, #071a1a 100%)",
      minHeight: "100vh",
      paddingTop: "6rem",
      paddingBottom: "5rem",
    }}>
      {/* ── Animated Background Orbs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="animate-float-slow absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full opacity-25"
          style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.4) 0%, transparent 70%)" }} />
        <div className="animate-morph absolute -top-20 -right-32 w-96 h-96 opacity-20"
          style={{ background: "radial-gradient(ellipse, rgba(20,184,166,0.5) 0%, transparent 70%)" }} />
        <div className="animate-float absolute bottom-10 left-10 w-64 h-64 rounded-full opacity-15"
          style={{ background: "radial-gradient(ellipse, rgba(52,211,153,0.4) 0%, transparent 70%)", animationDelay: "2s" }} />

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(rgba(52,211,153,0.8) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-40"
            style={{
              left: `${15 + i * 14}%`,
              animation: `particle-float ${5 + i * 1.2}s linear infinite`,
              animationDelay: `${i * 0.8}s`,
            }} />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Announcement Bar ── */}
        <div className="flex justify-center mb-10 animate-fade-in-down">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border text-emerald-300 text-xs sm:text-sm font-bold"
            style={{ background: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.25)", backdropFilter: "blur(12px)" }}>
            <SparklesIcon className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Highest scrap prices in Delhi NCR & Bengaluru • Instant UPI on spot</span>
            <Link to="/rates" className="underline hover:text-white font-black ml-1 transition-colors">
              View Rates →
            </Link>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left: Headline */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] animate-fade-in-up">
              Sell your scrap online at{" "}
              <span className="inline-block relative">
                <span
                  className="transition-all duration-300"
                  style={{
                    background: "linear-gradient(135deg, #34d399, #10b981, #06b6d4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    opacity: wordVisible ? 1 : 0,
                    transform: wordVisible ? "translateY(0)" : "translateY(8px)",
                    display: "inline-block",
                    transition: "opacity 0.3s ease, transform 0.3s ease",
                  }}
                >
                  {CYCLING_WORDS[wordIdx]}
                </span>
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed animate-fade-in-up stagger-2"
              style={{ opacity: 0, animationFillMode: "forwards" }}>
              India's trusted doorstep scrap pickup service. Certified digital weighing,
              transparent prices, and instant cash or UPI payout — every time.
            </p>

            {/* Feature Badges */}
            <div className="mt-8 grid grid-cols-2 gap-3 max-w-lg mx-auto lg:mx-0 animate-fade-in-up stagger-3"
              style={{ opacity: 0, animationFillMode: "forwards" }}>
              {[
                { icon: <ScaleIcon className="w-5 h-5" />, label: "100% Digital Weighing" },
                { icon: <BoltIcon className="w-5 h-5" />, label: "Instant UPI / Cash" },
                { icon: <ShieldCheckIcon className="w-5 h-5" />, label: "Verified Staff" },
                { icon: <CheckCircleIcon className="w-5 h-5" />, label: "Eco Recycling" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl transition-all duration-200 hover:border-emerald-500/50 hover:-translate-y-0.5"
                  style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}>
                  <span className="text-emerald-400 shrink-0">{f.icon}</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-200">{f.label}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start animate-fade-in-up stagger-4"
              style={{ opacity: 0, animationFillMode: "forwards" }}>
              <Link to="/sellWaste"
                className="px-8 py-4 font-black rounded-2xl flex items-center gap-2.5 transition-all duration-200 hover:scale-[1.03] active:scale-98 text-base text-slate-950"
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  boxShadow: "0 8px 32px rgba(16,185,129,0.35), 0 0 0 1px rgba(16,185,129,0.2)",
                }}>
                <span>Schedule Free Pickup</span>
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <Link to="/rates"
                className="px-7 py-4 font-bold rounded-2xl border transition-all text-base flex items-center gap-2 hover:border-emerald-500/50 hover:-translate-y-0.5"
                style={{ background: "rgba(30,41,59,0.6)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
                <span>Check Scrap Rates</span>
                <span className="text-emerald-400 font-black">₹</span>
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-8 flex items-center gap-4 justify-center lg:justify-start animate-fade-in-up stagger-5"
              style={{ opacity: 0, animationFillMode: "forwards" }}>
              <div className="flex -space-x-2">
                {["👨‍💼","👩‍💼","👨‍🏫","👩‍🔬","👨‍💻"].map((e, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-sm">{e}</div>
                ))}
              </div>
              <div className="text-sm text-slate-400">
                <span className="text-white font-bold">45,000+</span> happy customers •{" "}
                <span className="text-emerald-400 font-bold">4.9★</span> rated
              </div>
            </div>
          </div>

          {/* Right: Booking Card */}
          <div className="lg:col-span-5 animate-fade-in-up stagger-2" style={{ opacity: 0, animationFillMode: "forwards" }}>
            <div className="relative" style={{
              background: "rgba(255,255,255,0.97)",
              borderRadius: "28px",
              padding: "32px",
              boxShadow: "0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
            }}>
              {/* Glow ring behind card */}
              <div className="absolute -inset-1 rounded-[32px] opacity-50 -z-10 blur-xl"
                style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.4), rgba(20,184,166,0.3))" }} />

              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full"
                  style={{ background: "linear-gradient(135deg, #d1fae5, #a7f3d0)", color: "#065f46" }}>
                  ⚡ Doorstep Pickup in 3 Steps
                </span>
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  Available Today
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Book a Scrap Pickup
              </h2>
              <p className="text-sm text-slate-500 mt-1.5">
                Enter your mobile & city to schedule instant doorstep pickup.
              </p>

              <form onSubmit={handleQuickBook} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Select Your City
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ id: "delhi-ncr", label: "📍 Delhi NCR" }, { id: "bengaluru", label: "📍 Bengaluru" }].map((c) => (
                      <button key={c.id} type="button" onClick={() => setSelectedCity(c.id)}
                        className={`p-3 rounded-xl text-xs font-bold border text-center transition-all duration-200 ${
                          selectedCity === c.id
                            ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm shadow-emerald-100"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                        }`}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 text-sm font-bold">+91</div>
                    <input type="tel" maxLength={10} value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder="98765 43210"
                      className="w-full pl-14 pr-4 py-3.5 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200"
                      style={{
                        background: "#f8fafc",
                        border: "1.5px solid #e2e8f0",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                      onFocus={(e) => { e.target.style.border = "1.5px solid #10b981"; e.target.style.boxShadow = "0 0 0 4px rgba(16,185,129,0.1)"; e.target.style.background = "#fff"; }}
                      onBlur={(e) => { e.target.style.border = "1.5px solid #e2e8f0"; e.target.style.boxShadow = "none"; e.target.style.background = "#f8fafc"; }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl border flex items-center justify-between text-xs"
                  style={{ background: "rgba(236,253,245,0.8)", borderColor: "#a7f3d0" }}>
                  <span className="text-slate-600 font-medium">Popular items we buy:</span>
                  <span className="font-bold text-emerald-800">Paper • AC • Metal • E-Waste</span>
                </div>

                <button type="submit"
                  className="w-full py-4 text-white font-black text-base rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-98 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #059669, #10b981, #059669)",
                    backgroundSize: "200% 200%",
                    boxShadow: "0 8px 24px rgba(16,185,129,0.35)",
                  }}>
                  <span>Continue to Select Date & Time</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-6 text-[11px] text-slate-400 font-medium">
                <span>🛡️ Zero Booking Charges</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span>⚡ Instant Payment</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span>📱 100% Safe</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Media Recognition Bar ── */}
        <div className="mt-20 pt-10 border-t text-center animate-fade-in" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-7">
            Featured & Recognized By
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-50 hover:opacity-80 transition-opacity duration-500 grayscale hover:grayscale-0">
            {["🦈 Shark Tank", "YOURSTORY", "Forbes", "Inc42", "THE ECONOMIC TIMES"].map((m, i) => (
              <span key={i} className="font-extrabold text-lg tracking-tight text-slate-300">{m}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
