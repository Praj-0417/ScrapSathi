import React from "react";
import { Link } from "react-router-dom";
import { DocumentCheckIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-28 pb-20 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="space-y-3 border-b border-slate-800 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <DocumentCheckIcon className="w-4 h-4" />
            <span>Service Terms</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-400">
            Last updated: September 2026 • Governing doorstep scrap collection and recycling transactions
          </p>
        </div>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 space-y-6 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-white">1. Service Overview</h2>
            <p>
              ScrapSaathi provides an online marketplace and coordination technology connecting households, housing societies, and businesses with certified local scrap collection partners.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-white">2. Weighing & Payout Rules</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>All scrap items must be weighed on digital scales verified by the customer before loading.</li>
              <li>Scrap rates shown on the live rate board represent current market indicative prices and may adjust for contamination or moisture.</li>
              <li>Payments are made on the spot via digital UPI or cash before the collector departs with verified scrap.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-white">3. Prohibited Materials</h2>
            <p>
              Users agree not to offer bio-hazardous medical waste, explosive/flammable materials, radioactive substances, or stolen property for collection. Collectors retain full discretion to reject hazardous items.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-white">4. Cancellations & Rescheduling</h2>
            <p>
              Citizens may reschedule or cancel scheduled pickup appointments free of charge via their User Dashboard prior to the arrival of the assigned scrap collector.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-white">5. Contact Information</h2>
            <p>
              For grievances or service disputes, contact our helpdesk at{" "}
              <a href="mailto:help@scrapsaathi.in" className="text-emerald-400 font-bold underline">
                help@scrapsaathi.in
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
