import React from "react";
import { Link } from "react-router-dom";
import { HomeIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

export const Error = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 text-white selection:bg-emerald-500 selection:text-white"
      style={{
        background:
          "linear-gradient(145deg, #020d18 0%, #051a14 30%, #0a1628 60%, #071a1a 100%)",
      }}
    >
      {/* Glow Orb */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(ellipse, rgba(16,185,129,0.4) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-md w-full text-center space-y-6">
        {/* 404 Badge */}
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mx-auto shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #059669, #10b981)",
            boxShadow: "0 16px 48px rgba(16,185,129,0.35)",
          }}
        >
          🔍
        </div>

        <div>
          <h1
            className="text-7xl sm:text-8xl font-black tracking-tighter"
            style={{
              background: "linear-gradient(135deg, #34d399, #10b981, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </h1>
          <p className="text-lg font-bold text-white mt-2">
            Page Not Found
          </p>
          <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
            The page you're looking for doesn't exist or has been moved. Let's
            get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="px-6 py-3 font-black rounded-2xl flex items-center gap-2 text-sm text-slate-950 transition-all hover:scale-105 active:scale-98"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 8px 24px rgba(16,185,129,0.3)",
            }}
          >
            <HomeIcon className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <Link
            to="/contact"
            className="px-6 py-3 font-bold rounded-2xl flex items-center gap-2 text-sm text-slate-300 transition-all hover:text-white hover:-translate-y-0.5"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4 text-emerald-400" />
            Report Issue
          </Link>
        </div>
      </div>
    </div>
  );
};
