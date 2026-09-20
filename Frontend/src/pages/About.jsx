import React from "react";
import { Link } from "react-router-dom";
import {
  SparklesIcon,
  ShieldCheckIcon,
  ScaleIcon,
  GlobeAmericasIcon,
  ArrowRightIcon,
  CheckBadgeIcon,
  HeartIcon,
  UserGroupIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

export default function About() {
  const leadership = [
    {
      name: "Pranav Raj",
      role: "Founder & Chief Executive Officer",
      bio: "Spearheading circular waste economy innovation, zero-landfill smart routing, and digital doorstep recycling.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Aman Kumar",
      role: "Co-Founder",
      bio: "Spearheading operational resilience, logistics integration, and community recycling networks.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Prajjwal Sharma",
      role: "Co-Founder & Chief Technology Officer",
      bio: "Architecting high-scale distributed IoT scales, live geospatial collector dispatch, and real-time scrap market analytics.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    },
  ];

  const milestones = [
    { value: "45,000+", label: "Happy Households", sub: "Recycling every month" },
    { value: "1,200+", label: "Tons Diverted", sub: "From overflowing landfills" },
    { value: "350+", label: "Verified Collectors", sub: "Empowered with digital scales" },
    { value: "100%", label: "Fair Price Guarantee", sub: "Instant doorstep UPI payouts" },
  ];

  return (
    <div
      className="min-h-screen text-slate-100 pt-28 pb-24 selection:bg-emerald-500 selection:text-white relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #020d18 0%, #051a14 30%, #0a1628 60%, #071a1a 100%)",
      }}
    >
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="animate-float-slow absolute top-10 left-1/4 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.35) 0%, transparent 70%)" }}
        />
        <div
          className="animate-float absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-15"
          style={{ background: "radial-gradient(ellipse, rgba(6,182,212,0.3) 0%, transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(rgba(52,211,153,0.8) 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold backdrop-blur-md">
            <SparklesIcon className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Pioneering India's Sustainable Scrap Revolution</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Transforming Waste into{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #34d399, #10b981, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Wealth & Green Impact
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            ScrapSaathi is India's tech-driven doorstep scrap collection and recycling ecosystem. We combine calibrated ISO digital scales, live vehicle GPS tracking, transparent market pricing, and instant UPI payouts.
          </p>
        </div>

        {/* Impact Numbers Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {milestones.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-xl text-center space-y-1"
            >
              <p
                className="text-3xl sm:text-4xl font-black"
                style={{
                  background: "linear-gradient(135deg, #34d399, #10b981)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {item.value}
              </p>
              <p className="text-xs font-bold text-white uppercase tracking-wider">{item.label}</p>
              <p className="text-[11px] text-slate-400">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Mission & Vision Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <ScaleIcon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white">Absolute Transparency</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Traditional scrap selling suffers from altered analog scales and opaque pricing. We provide certified digital electronic weighing with live customer verification.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
              <GlobeAmericasIcon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white">Zero-Landfill Circularity</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Every kilogram of collected paper, metal, electronic waste, and plastic is channeled directly to authorized green recycling plants, slashing industrial carbon emissions.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <UserGroupIcon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white">Informal Sector Dignity</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              We empower local waste collectors with tech tools, steady dignified earnings, safety equipment, and financial inclusion into modern digital banking.
            </p>
          </div>
        </div>

        {/* Leadership Team */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
              Founding Leadership
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">Built by Passioneers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {leadership.map((member, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left"
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-500/30 shrink-0 shadow-lg">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white">{member.name}</h3>
                  <p className="text-xs font-bold text-emerald-400">{member.role}</p>
                  <p className="text-xs text-slate-400 leading-relaxed pt-1">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Card */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 shadow-2xl text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black text-white">Join the Clean Scrap Movement</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Schedule your free doorstep collection today or join our verified collector fleet to build a greener Bharat.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/sellWaste"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Schedule Doorstep Pickup</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
            <Link
              to="/rates"
              className="px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-colors"
            >
              Check Scrap Rates
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
