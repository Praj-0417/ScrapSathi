import React from "react";
import HeroScrapUncle from "../components/HeroScrapUncle";
import LiveRatesPreview from "../components/LiveRatesPreview";
import HowItWorksScrapUncle from "../components/HowItWorksScrapUncle";
import WhyChooseUsScrapUncle from "../components/WhyChooseUsScrapUncle";
import CommercialB2B from "../components/CommercialB2B";
import ImpactMetrics from "../components/ImpactMetrics";
import TestimonialsScrapUncle from "../components/TestimonialsScrapUncle";
import TestimonialsFAQ from "../components/TestimonialsFAQ";
import { Link } from "react-router-dom";
import { ArrowRightIcon, PhoneIcon } from "@heroicons/react/24/outline";

function BottomCTABanner() {
  return (
    <section className="relative py-24 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #031a12 0%, #020d18 50%, #031a12 100%)" }}>
      {/* Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="animate-float-slow absolute top-0 left-1/4 w-72 h-72 rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.5) 0%, transparent 70%)" }} />
        <div className="animate-float absolute bottom-0 right-1/4 w-56 h-56 rounded-full opacity-15"
          style={{ background: "radial-gradient(ellipse, rgba(20,184,166,0.4) 0%, transparent 70%)", animationDelay: "3s" }} />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(rgba(52,211,153,0.9) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
          <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
            🌿 Join 45,000+ Happy Recyclers
          </span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Ready to Sell Your Scrap{" "}
          <span style={{
            background: "linear-gradient(135deg, #34d399, #10b981, #06b6d4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            at the Best Price?
          </span>
        </h2>
        <p className="text-base sm:text-lg text-slate-400 mt-4 max-w-2xl mx-auto leading-relaxed">
          Book in 30 seconds. We come to your door. You get paid instantly. It's that simple.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/sellWaste"
            className="px-10 py-4 font-black rounded-2xl flex items-center gap-2.5 text-base text-slate-950 transition-all hover:scale-105 active:scale-98"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 12px 40px rgba(16,185,129,0.4)",
            }}>
            <span>Book Free Doorstep Pickup</span>
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
          <a href="tel:+918800000000"
            className="px-8 py-4 font-bold rounded-2xl flex items-center gap-2.5 text-sm text-slate-300 transition-all hover:text-white hover:-translate-y-0.5"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <PhoneIcon className="w-4 h-4 text-emerald-400" />
            Call: 1800-XXX-XXXX
          </a>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-semibold">
          <span>✅ 100% Free Pickup</span>
          <span>⚡ Instant Payment</span>
          <span>🛡️ Verified Staff</span>
          <span>📱 Real-time Tracking</span>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="font-sans min-h-screen">
      <HeroScrapUncle />
      <LiveRatesPreview />
      <HowItWorksScrapUncle />
      <WhyChooseUsScrapUncle />
      <ImpactMetrics />
      <CommercialB2B />
      <TestimonialsScrapUncle />
      <TestimonialsFAQ />
      <BottomCTABanner />
    </div>
  );
}
