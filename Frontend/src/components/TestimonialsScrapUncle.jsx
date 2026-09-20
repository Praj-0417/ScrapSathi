import React, { useState, useRef, useEffect } from "react";
import { StarIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Anjali Sharma",
    role: "Homemaker, Delhi NCR",
    avatar: "👩",
    bgColor: "#fef3c7",
    rating: 5,
    text: "I used to dread calling the local kabadiwala — they'd always argue and give me wrong readings. ScrapSaathi's app is so easy! The executive came on time, the digital scale was transparent, and I got ₹3,200 straight to my PhonePe. Done in 20 minutes.",
    items: "Paper, Cardboard, Steel",
    amount: "₹3,200",
    date: "2 weeks ago",
  },
  {
    id: 2,
    name: "Rohit Gupta",
    role: "Tech Professional, Bengaluru",
    avatar: "👨‍💻",
    bgColor: "#dbeafe",
    rating: 5,
    text: "Sold my old ACs, fridge, and a pile of gadgets — all in one go. They gave me a CO2 offset certificate! Incredibly professional staff. The price was much better than other sites. Will definitely use again for my e-waste.",
    items: "ACs (2), Fridge, E-Waste",
    amount: "₹12,500",
    date: "1 month ago",
  },
  {
    id: 3,
    name: "Meera Krishnan",
    role: "Teacher, Bengaluru",
    avatar: "👩‍🏫",
    bgColor: "#d1fae5",
    rating: 5,
    text: "I'm very environmentally conscious and loved the sustainability report I received. The live price checker tool helped me decide the best time to sell. Prompt service, no hidden deductions. The team was courteous and professional.",
    items: "Paper, Newspaper, Copper",
    amount: "₹1,850",
    date: "3 weeks ago",
  },
  {
    id: 4,
    name: "Sandeep Verma",
    role: "Small Business Owner, Delhi",
    avatar: "👨‍💼",
    bgColor: "#ede9fe",
    rating: 5,
    text: "We had 3 months of accumulated office scrap — electronics, cardboard boxes, old furniture. ScrapSaathi handled everything professionally. Bulk pricing was fair, payment was immediate. Saved us multiple trips to the recycling centre.",
    items: "Office Electronics, Furniture, Cardboard",
    amount: "₹28,400",
    date: "5 days ago",
  },
  {
    id: 5,
    name: "Priya Nair",
    role: "Designer, Bengaluru",
    avatar: "👩‍🎨",
    bgColor: "#fce7f3",
    rating: 5,
    text: "Best experience! The app is beautiful and easy to use. Got a real-time update when my pickup was confirmed and when the executive was on their way. Like Swiggy but for scrap! They gave me the best rate for my copper wire.",
    items: "Copper Wires, Old Gadgets",
    amount: "₹4,100",
    date: "10 days ago",
  },
];

export default function TestimonialsScrapUncle() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const autoplayRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    autoplayRef.current = setInterval(() => {
      setActiveIdx((i) => (i + 1) % TESTIMONIALS.length);
    }, 4500);
    return () => clearInterval(autoplayRef.current);
  }, [autoplay]);

  const goTo = (idx) => {
    setAutoplay(false);
    setActiveIdx((idx + TESTIMONIALS.length) % TESTIMONIALS.length);
    setTimeout(() => setAutoplay(true), 12000);
  };

  const current = TESTIMONIALS[activeIdx];

  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden" style={{ background: "#fff" }}>
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.8) 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-5 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.8) 0%, transparent 70%)" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full mb-4"
            style={{ background: "linear-gradient(135deg, #d1fae5, #a7f3d0)" }}>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800">💬 Customer Stories</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            45,000+ Happy Customers{" "}
            <span style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>Can't Be Wrong</span>
          </h2>
          <p className="text-base text-slate-500 mt-3">
            Real reviews from real customers. Unfiltered, unedited.
          </p>

          {/* Star row */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className="w-5 h-5 text-amber-400" />
            ))}
            <span className="ml-2 font-black text-slate-700 text-sm">4.9 / 5</span>
            <span className="text-slate-400 text-sm ml-1">from 12,000+ reviews</span>
          </div>
        </div>

        {/* Main testimonial display */}
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          {/* Side dots / mini cards */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-3">
            {TESTIMONIALS.map((t, i) => (
              <button key={t.id} onClick={() => goTo(i)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 text-sm ${
                  i === activeIdx
                    ? "bg-emerald-50 border border-emerald-200"
                    : "hover:bg-slate-50 border border-transparent"
                }`}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: t.bgColor }}>{t.avatar}</div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 text-xs truncate">{t.name}</div>
                  <div className="text-slate-400 text-[10px] truncate">{t.role}</div>
                </div>
                {i === activeIdx && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-auto shrink-0 animate-pulse" />}
              </button>
            ))}
          </div>

          {/* Main featured card */}
          <div className="lg:col-span-9">
            <div key={current.id}
              className="rounded-3xl p-8 sm:p-10 relative overflow-hidden transition-all duration-500"
              style={{
                background: "linear-gradient(135deg, #0f172a, #0c1f1a)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.15)",
                animation: "fadeIn 0.4s ease forwards",
              }}>
              {/* Glow */}
              <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full opacity-20 pointer-events-none"
                style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.6) 0%, transparent 70%)" }} />

              {/* Top bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                    style={{ background: current.bgColor }}>
                    {current.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-white text-base">{current.name}</h3>
                      <CheckBadgeIcon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-slate-400 text-xs">{current.role}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="w-4 h-4 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">{current.date}</span>
                </div>
              </div>

              {/* Quote */}
              <div className="text-4xl text-emerald-700 font-black leading-none mb-3 opacity-50">"</div>
              <p className="text-slate-200 text-base sm:text-lg leading-relaxed font-medium">
                {current.text}
              </p>

              {/* Items + amount */}
              <div className="mt-8 pt-6 flex flex-wrap items-center gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Items sold: <span className="text-white font-semibold ml-1">{current.items}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Received: <span className="text-emerald-400 font-black ml-1 text-sm">{current.amount}</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex gap-2">
                {TESTIMONIALS.map((_, i) => (
                  <button key={i} onClick={() => goTo(i)}
                    className={`transition-all duration-300 rounded-full ${
                      i === activeIdx ? "bg-emerald-500 w-8 h-2.5" : "bg-slate-200 w-2.5 h-2.5 hover:bg-slate-300"
                    }`} />
                ))}
              </div>

              <div className="flex gap-2">
                <button onClick={() => goTo(activeIdx - 1)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-emerald-50 hover:text-emerald-600"
                  style={{ border: "1.5px solid #e2e8f0", color: "#64748b" }}>
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button onClick={() => goTo(activeIdx + 1)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:text-white"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff" }}>
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
