import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDaysIcon,
  TruckIcon,
  BanknotesIcon,
  ArrowRightIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";

const steps = [
  {
    number: "01",
    title: "Schedule a Pickup",
    subtitle: "Select items, convenient date & 3-hour time slot online in 30 seconds.",
    icon: <CalendarDaysIcon className="w-7 h-7" />,
    features: ["Custom date & time", "Add scrap photo (optional)", "Instant SMS confirmation"],
    color: "#10b981",
    glow: "rgba(16,185,129,0.25)",
  },
  {
    number: "02",
    title: "Executive at Doorstep",
    subtitle: "Our verified executive arrives on time with a certified digital weighing scale.",
    icon: <TruckIcon className="w-7 h-7" />,
    features: ["100% digital scale", "Uniformed & background verified", "Zero weighing manipulation"],
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.25)",
  },
  {
    number: "03",
    title: "Instant Payment & Impact",
    subtitle: "Get paid instantly via UPI, Bank Transfer or Cash plus your green recycling certificate.",
    icon: <BanknotesIcon className="w-7 h-7" />,
    features: ["Direct to GooglePay/PhonePe", "Live invoice receipt", "CO2 savings certificate"],
    color: "#8b5cf6",
    glow: "rgba(139,92,246,0.25)",
  },
];

export default function HowItWorksScrapUncle() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #020d18 0%, #031a12 50%, #020d18 100%)" }}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.6) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, rgba(6,182,212,0.5) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(rgba(52,211,153,0.9) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center max-w-3xl mx-auto mb-20 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-emerald-400 mb-5"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
            ⚡ Simple 3-Step Process
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            How ScrapSaathi{" "}
            <span style={{
              background: "linear-gradient(135deg, #34d399, #10b981)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Doorstep Pickup
            </span>{" "}
            Works
          </h2>
          <p className="text-base text-slate-400 mt-4">
            No more waiting for local kabadiwala or bargaining with inaccurate scales.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.3), rgba(6,182,212,0.3), transparent)" }} />

          {steps.map((step, idx) => (
            <div key={step.number}
              className={`relative group rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{
                background: "rgba(15,23,42,0.7)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(16px)",
                transitionDelay: `${idx * 150}ms`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = `1px solid ${step.color}40`;
                e.currentTarget.style.boxShadow = `0 24px 60px rgba(0,0,0,0.3), 0 0 40px ${step.glow}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Step Number */}
              <div className="absolute top-6 right-6 text-5xl font-black opacity-10 group-hover:opacity-20 transition-opacity"
                style={{ color: step.color }}>
                {step.number}
              </div>

              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                style={{ background: `${step.color}18`, color: step.color, border: `1px solid ${step.color}30` }}>
                {step.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-black text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">{step.subtitle}</p>

              {/* Checklist */}
              <ul className="space-y-2.5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {step.features.map((feat, fi) => (
                  <li key={fi} className="flex items-center gap-2.5 text-xs font-semibold text-slate-300">
                    <CheckBadgeIcon className="w-4 h-4 shrink-0" style={{ color: step.color }} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              {/* Bottom color bar */}
              <div className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${step.color}, transparent)` }} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={`text-center mt-16 transition-all duration-700 delay-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <Link to="/sellWaste"
            className="inline-flex items-center gap-2.5 px-10 py-4 font-black rounded-2xl text-slate-950 text-base transition-all duration-200 hover:scale-[1.03] active:scale-98"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 12px 36px rgba(16,185,129,0.35)",
            }}>
            <span>Book Your Free Pickup Now</span>
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
          <p className="text-xs text-slate-500 mt-3">Zero booking fees • Minimum order ~15kg or ₹200 value</p>
        </div>
      </div>
    </section>
  );
}
