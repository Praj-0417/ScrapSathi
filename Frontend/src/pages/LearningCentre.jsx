import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpenIcon,
  DevicePhoneMobileIcon,
  SparklesIcon,
  ScaleIcon,
  GlobeAmericasIcon,
  ArrowRightIcon,
  CheckBadgeIcon,
  ArrowPathIcon,
  LightBulbIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function LearningCentre() {
  const [activeTab, setActiveTab] = useState("segregation");

  const tabs = [
    { id: "segregation", label: "Scrap Segregation 101", icon: BookOpenIcon },
    { id: "app-guide", label: "App & Live Tracking Guide", icon: DevicePhoneMobileIcon },
    { id: "pricing", label: "Transparent Weighing", icon: ScaleIcon },
    { id: "carbon-impact", label: "Ecological Impact", icon: GlobeAmericasIcon },
  ];

  return (
    <div
      className="min-h-screen text-slate-100 pt-28 pb-24 selection:bg-emerald-500 selection:text-white relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #020d18 0%, #051a14 30%, #0a1628 60%, #071a1a 100%)",
      }}
    >
      {/* Glow Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="animate-float-slow absolute top-10 left-1/4 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.35) 0%, transparent 70%)" }}
        />
        <div
          className="animate-float absolute bottom-10 right-10 w-96 h-96 rounded-full opacity-15"
          style={{ background: "radial-gradient(ellipse, rgba(6,182,212,0.3) 0%, transparent 70%)" }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 space-y-12">
        
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold backdrop-blur-md">
            <LightBulbIcon className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Circular Economy Knowledge Base</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            ScrapSaathi{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #34d399, #10b981, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Learning Hub
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Learn how to segregate recyclable scrap, maximize your doorstep payout, and protect the planet with zero-landfill practices.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? "bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10"
                    : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? "text-emerald-400" : "text-slate-400"}`} />
                <span className={`text-xs font-black ${isSelected ? "text-white" : "text-slate-300"}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Cards */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl space-y-8 animate-fade-in">
          {activeTab === "segregation" && (
            <div className="space-y-6">
              <div className="space-y-2 border-b border-slate-800 pb-4">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Module 01</span>
                <h3 className="text-2xl font-black text-white">How to Segregate Household Scrap for Top Payout</h3>
                <p className="text-xs text-slate-400">
                  Separating different grades of metal, paper, and plastic directly increases your doorstep payout value.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <h4 className="font-bold text-emerald-400 text-sm">📰 Paper & Cardboard</h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li>• Keep newspapers tied separately from cardboard cartons for the highest paper grade rate.</li>
                    <li>• Ensure paper scrap is kept dry (wet paper loses fiber value and attracts moisture discount).</li>
                    <li>• Hardcover books, shredded office paper, and magazines have distinct recyclability grades.</li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <h4 className="font-bold text-teal-400 text-sm">🔩 Metal Segregation</h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li>• Test with a magnet: Copper, Brass, and Aluminium are non-magnetic and command higher rates (₹200-₹700/kg).</li>
                    <li>• Keep heavy iron, grills, and structural steel in a separate pile for fast bulk weighing.</li>
                    <li>• Empty all paint or chemical cans before handing over to the collector.</li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <h4 className="font-bold text-cyan-400 text-sm">💻 E-Waste & Appliances</h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li>• Do not dismantle circuit boards or compressors yourself to prevent hazardous leakage.</li>
                    <li>• Laptops, CPUs, and AC units are valued as complete units with instant electronic payout.</li>
                    <li>• 100% of e-waste is processed in government-authorized R2/e-Stewards compliant plants.</li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <h4 className="font-bold text-emerald-400 text-sm">🧴 Plastics & Bottles</h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li>• Separate clear PET water bottles from rigid HDPE oil / detergent containers.</li>
                    <li>• Crush empty plastic bottles to minimize volume and make transportation eco-friendly.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "app-guide" && (
            <div className="space-y-6">
              <div className="space-y-2 border-b border-slate-800 pb-4">
                <span className="text-xs font-black uppercase tracking-wider text-teal-400">Module 02</span>
                <h3 className="text-2xl font-black text-white">Using ScrapSaathi Live Map & Payouts</h3>
                <p className="text-xs text-slate-400">
                  Step-by-step walkthrough of booking, live GPS tracking, and digital scale settlement.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Pin Your Doorstep on Interactive Map</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Use the "Locate Me" button or drag the eco-marker pin to your exact building or society gate.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-black shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Choose Your Doorstep Payout Mode</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Select Instant UPI (GPay/PhonePe), Cash at Doorstep, Direct Bank IMPS, or Green Wallet (+5% bonus).
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Track Collector Live on Route</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Watch the collector drive towards your doorstep on the live map in real time with estimated arrival minutes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "pricing" && (
            <div className="space-y-6">
              <div className="space-y-2 border-b border-slate-800 pb-4">
                <span className="text-xs font-black uppercase tracking-wider text-cyan-400">Module 03</span>
                <h3 className="text-2xl font-black text-white">How ScrapSaathi Prevents Scale Manipulation</h3>
                <p className="text-xs text-slate-400">
                  Certified digital weighment technology to ensure you receive 100% of your scrap value.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-400 text-xs">
                    <ShieldCheckIcon className="w-4 h-4" />
                    <span>Live Zero Tare Verification</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    The collector resets the digital electronic scale in front of you. You verify the 0.00 KG display before any item is placed on the scale.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-teal-400 text-xs">
                    <CheckBadgeIcon className="w-4 h-4" />
                    <span>Instant Digital Receipt</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    As soon as weighing concludes, an itemized digital receipt with exact weight, unit rate, and total payout is generated in your dashboard.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "carbon-impact" && (
            <div className="space-y-6">
              <div className="space-y-2 border-b border-slate-800 pb-4">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Module 04</span>
                <h3 className="text-2xl font-black text-white">Understanding Your Carbon & Deforestation Offset</h3>
                <p className="text-xs text-slate-400">
                  How recycling small everyday scrap prevents thousands of tons of greenhouse gases.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <p className="text-3xl font-black text-emerald-400">17 Trees</p>
                  <p className="text-xs font-bold text-white uppercase">Per 1 Ton Paper</p>
                  <p className="text-[11px] text-slate-400">Recycling 1 ton of paper saves 17 mature trees and 26,000 liters of water.</p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <p className="text-3xl font-black text-teal-400">95% Energy</p>
                  <p className="text-xs font-bold text-white uppercase">Aluminium Recycling</p>
                  <p className="text-[11px] text-slate-400">Recycled aluminium uses 95% less energy than raw bauxite mining.</p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <p className="text-3xl font-black text-cyan-400">1.8 KG CO₂</p>
                  <p className="text-xs font-bold text-white uppercase">Per KG Diverted</p>
                  <p className="text-[11px] text-slate-400">Every single kilogram diverted from landfills saves ~1.8 kg of atmospheric CO₂.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/50 border border-emerald-500/20 text-center space-y-4">
          <h3 className="text-xl sm:text-2xl font-black text-white">Ready to Put Knowledge into Action?</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Book your free doorstep pickup now and earn top rates for your sorted recyclables.
          </p>
          <div>
            <Link
              to="/sellWaste"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs shadow-xl shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <span>Schedule Free Pickup</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
