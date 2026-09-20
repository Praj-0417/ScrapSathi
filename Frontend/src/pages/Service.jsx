import React from "react";
import { Link } from "react-router-dom";
import {
  TruckIcon,
  ScaleIcon,
  SparklesIcon,
  BuildingOffice2Icon,
  CpuChipIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  ArrowPathRoundedSquareIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";

export default function Service() {
  const services = [
    {
      title: "Doorstep Residential Scrap Collection",
      desc: "Instant doorstep pickup for newspapers, cardboard, old books, plastic bottles, iron, and utensils with calibrated digital scales and instant UPI payment.",
      badge: "Most Popular",
      icon: TruckIcon,
      features: ["Zero pickup charges", "Instant UPI / Cash payout", "Live GPS executive tracking", "Verified background-checked staff"],
      cta: "/sellWaste",
      ctaText: "Book Household Pickup",
    },
    {
      title: "B2B & Commercial Waste Circularity",
      desc: "Bulk recycling solutions tailored for corporate IT parks, manufacturing plants, educational institutions, and retail warehouses.",
      badge: "Bulk & Enterprise",
      icon: BuildingOffice2Icon,
      features: ["Customized GST scrap invoicing", "Green Recycling Certificate & EPR compliance", "Dedicated industrial vehicle fleets", "Scheduled weekly / monthly collection"],
      cta: "/sellWaste",
      ctaText: "Schedule B2B Pickup",
    },
    {
      title: "Certified E-Waste & Appliance Disposal",
      desc: "Authorized environmentally-safe disposal for obsolete laptops, CPUs, servers, air conditioners, and refrigerators with zero-landfill guarantee.",
      badge: "Eco-Compliant",
      icon: CpuChipIcon,
      features: ["Complete data destruction certificate", "Govt-authorized recycling plants", "Safe heavy appliance dismantling", "Fair market residual valuations"],
      cta: "/sellWaste",
      ctaText: "Recycle E-Waste",
    },
    {
      title: "Vehicle Scrap & Dismantling (RVSF)",
      desc: "Official deregistration and eco-friendly scrapping of end-of-life two-wheelers, cars, and commercial vehicles with valid scrapping certificates.",
      badge: "Govt. Scrappage Policy",
      icon: ArrowPathRoundedSquareIcon,
      features: ["RTO scrap de-registration assistance", "Best weight-based metal value", "Zero-hassle doorstep towing", "Eco-friendly component recycling"],
      cta: "/sellWaste",
      ctaText: "Scrap Your Vehicle",
    },
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
          className="animate-float-slow absolute top-10 left-1/3 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.35) 0%, transparent 70%)" }}
        />
        <div
          className="animate-float absolute bottom-10 right-10 w-96 h-96 rounded-full opacity-15"
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
            <span>Smart Zero-Landfill Recycling Solutions</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Our Comprehensive{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #34d399, #10b981, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Recycling Services
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            From household scrap collection to corporate EPR compliance, ScrapSaathi provides end-to-end technology-enabled circular waste solutions.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((svc, idx) => {
            const Icon = svc.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {svc.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white">{svc.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{svc.desc}</p>

                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    {svc.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-300">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <Link
                    to={svc.cta}
                    className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-400 font-black text-xs flex items-center justify-center gap-2 transition-all border border-slate-700 hover:border-emerald-500 shadow-md cursor-pointer"
                  >
                    <span>{svc.ctaText}</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Process Flow */}
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
              Simple 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">How ScrapSaathi Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center mx-auto text-sm">
                1
              </div>
              <h4 className="font-black text-white text-sm">Schedule on Map</h4>
              <p className="text-xs text-slate-400">
                Pin your doorstep on OpenStreetMap, select your scrap category and convenient date & time slot.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-400 font-black flex items-center justify-center mx-auto text-sm">
                2
              </div>
              <h4 className="font-black text-white text-sm">Doorstep Digital Weighment</h4>
              <p className="text-xs text-slate-400">
                Our uniformed executive arrives with an ISO certified digital weighing scale with real-time zero tare check.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 font-black flex items-center justify-center mx-auto text-sm">
                3
              </div>
              <h4 className="font-black text-white text-sm">Instant Payout & Receipt</h4>
              <p className="text-xs text-slate-400">
                Receive instant money in your UPI, Bank, or Cash before the collector leaves, along with digital invoice.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
