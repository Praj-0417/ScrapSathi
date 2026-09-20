import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { SCRAP_CATEGORIES } from "../data/scrapRatesData";
import { ArrowRightIcon, MapPinIcon, SparklesIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

const CITIES = [
  { id: "delhi-ncr", label: "Delhi NCR", flag: "🏙️" },
  { id: "bengaluru", label: "Bengaluru", flag: "🌳" },
];

export default function LiveRatesPreview() {
  const [selectedCity, setSelectedCity] = useState("delhi-ncr");
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const popularItems = SCRAP_CATEGORIES.flatMap((c) =>
    c.items.filter((i) => i.popular)
  ).slice(0, 8);

  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #fff 0%, #f0fdf4 60%, #fff 100%)" }}>
      {/* Subtle background grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-14 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full mb-4"
              style={{ background: "linear-gradient(135deg, #d1fae5, #a7f3d0)" }}>
              <SparklesIcon className="w-3.5 h-3.5 text-emerald-700" />
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800">Live Scrap Prices</span>
              <span className="relative flex h-2 w-2 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Popular Scrap Rates Today
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2">
              Transparent per-kg pricing. Zero hidden deductions, ever.
            </p>
          </div>

          {/* City Selector */}
          <div className="flex items-center gap-1 p-1.5 rounded-2xl"
            style={{ background: "rgba(15,23,42,0.06)", border: "1px solid rgba(15,23,42,0.08)" }}>
            <MapPinIcon className="w-4 h-4 text-emerald-600 ml-2 shrink-0" />
            {CITIES.map((c) => (
              <button key={c.id} onClick={() => setSelectedCity(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  selectedCity === c.id
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}>
                {c.flag} {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rate Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {popularItems.map((item, idx) => {
            const price = item.prices?.[selectedCity] || 0;
            return (
              <div key={item.id}
                className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  transitionDelay: `${idx * 60}ms`,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}>
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: "linear-gradient(135deg, rgba(236,253,245,0.8) 0%, rgba(240,253,250,0.5) 100%)" }} />

                <div className="relative p-5">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-3xl p-2 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      {item.icon}
                    </span>
                    <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md"
                      style={{ background: "#d1fae5", color: "#065f46" }}>
                      ✓ Verified
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">{item.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.description}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                    <div className="text-xl sm:text-2xl font-black text-emerald-600">
                      ₹{price}
                      <span className="text-xs font-semibold text-slate-400"> /{item.unit}</span>
                    </div>
                    <Link to="/rates" className="text-xs font-bold text-slate-400 group-hover:text-emerald-600 flex items-center gap-1 transition-colors">
                      <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
                      <span>Calc</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className={`mt-12 relative rounded-3xl overflow-hidden transition-all duration-700 delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ background: "linear-gradient(135deg, #0f172a 0%, #064e3b 100%)" }}>
          {/* Background noise/texture */}
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "radial-gradient(rgba(52,211,153,0.8) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-15"
            style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.6) 0%, transparent 70%)" }} />

          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 p-7 sm:p-8">
            <div>
              <h3 className="text-xl font-black text-white">Want rates for all 50+ scrap items?</h3>
              <p className="text-sm text-slate-400 mt-1">
                ACs, Fridges, E-Waste, Metals, Batteries, Vehicles — with our interactive calculator.
              </p>
            </div>
            <Link to="/rates"
              className="shrink-0 px-7 py-3.5 font-black rounded-2xl flex items-center gap-2 text-sm text-slate-950 transition-all hover:scale-105 active:scale-98"
              style={{
                background: "linear-gradient(135deg, #10b981, #34d399)",
                boxShadow: "0 8px 24px rgba(16,185,129,0.35)",
              }}>
              <span>View All Scrap Rates & Calculator</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
