import React, { useEffect, useRef, useState } from "react";

const METRICS = [
  {
    value: 45000,
    suffix: "+",
    label: "Pickups Completed",
    desc: "Delighted families & businesses",
    icon: "🏡",
    color: "from-emerald-500 to-teal-400",
    glow: "rgba(16,185,129,0.4)",
  },
  {
    value: 1.5,
    suffix: "M+ Kg",
    label: "Scrap Recycled",
    desc: "Kept away from city landfills",
    icon: "♻️",
    color: "from-teal-500 to-cyan-400",
    glow: "rgba(20,184,166,0.4)",
  },
  {
    value: 28500,
    suffix: "+",
    label: "Trees Saved",
    desc: "By paper & cardboard recycling",
    icon: "🌲",
    color: "from-green-500 to-emerald-400",
    glow: "rgba(34,197,94,0.4)",
  },
  {
    value: 14.2,
    suffix: "M L",
    label: "Water Conserved",
    desc: "Through sustainable metallurgy",
    icon: "💧",
    color: "from-blue-500 to-cyan-400",
    glow: "rgba(59,130,246,0.4)",
  },
];

function formatNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K";
  if (Number.isInteger(n)) return n.toLocaleString();
  return n.toString();
}

function AnimatedCounter({ target, suffix, started }) {
  const [display, setDisplay] = useState("0");
  const rafRef = useRef(null);

  useEffect(() => {
    if (!started) return;
    const isDecimal = !Number.isInteger(target);
    const duration = 1600;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quart
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = isDecimal
        ? parseFloat((eased * target).toFixed(1))
        : Math.round(eased * target);
      setDisplay(isDecimal ? current.toString() : formatNum(current));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started, target]);

  return (
    <span>
      {display}{suffix}
    </span>
  );
}

export default function ImpactMetrics() {
  const sectionRef = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #020c14 0%, #031a12 40%, #0a0f1a 100%)" }}>
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.5) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(rgba(16,185,129,0.8) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-emerald-400 px-4 py-1.5 rounded-full mb-4"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
            🌿 Our Environmental Impact
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-3 leading-tight">
            Real Numbers.{" "}
            <span style={{
              background: "linear-gradient(135deg, #34d399, #10b981, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Real Positive Change.
            </span>
          </h2>
          <p className="text-base text-slate-400 mt-4 leading-relaxed">
            Every newspaper, AC, and metal scrap you recycle through ScrapSaathi
            directly contributes to our green mission.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {METRICS.map((m, idx) => (
            <div key={idx}
              className="relative group rounded-3xl p-7 sm:p-8 transition-all duration-300 hover:-translate-y-2 cursor-default"
              style={{
                background: "rgba(15,23,42,0.7)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(16px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = `1px solid rgba(16,185,129,0.35)`;
                e.currentTarget.style.boxShadow = `0 20px 60px rgba(0,0,0,0.3), 0 0 40px ${m.glow}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Icon with gradient bg */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center text-2xl mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {m.icon}
              </div>

              {/* Counter */}
              <div className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-1"
                style={{
                  background: `linear-gradient(135deg, #fff 40%, ${m.glow.replace("0.4", "1")})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                <AnimatedCounter target={m.value} suffix={m.suffix} started={started} />
              </div>

              <div className="font-bold text-sm sm:text-base text-white mt-1">{m.label}</div>
              <div className="text-xs text-slate-500 mt-1 leading-relaxed">{m.desc}</div>

              {/* Bottom accent */}
              <div className={`mt-4 h-0.5 rounded-full bg-gradient-to-r ${m.color} opacity-40 group-hover:opacity-80 transition-opacity`} />
            </div>
          ))}
        </div>

        {/* Bottom Trust Row */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {[
            { label: "Cities Served", val: "15+" },
            { label: "Certified Partners", val: "200+" },
            { label: "Carbon Offset (tons)", val: "8,400+" },
            { label: "Avg. Rating", val: "4.9 ★" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-black text-emerald-400">{s.val}</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
