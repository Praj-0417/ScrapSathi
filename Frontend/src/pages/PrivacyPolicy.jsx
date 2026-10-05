import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheckIcon, DocumentTextIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function PrivacyPolicy() {
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
            <ShieldCheckIcon className="w-4 h-4" />
            <span>Legal Transparency</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-400">
            Last updated: September 2026 • Effective for all ScrapSaathi users and partners
          </p>
        </div>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 space-y-6 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-white">1. Information We Collect</h2>
            <p>
              When you use ScrapSaathi to book doorstep scrap collection, we collect necessary contact and pickup details including your name, email address, phone number, physical pickup location, and geocoordinates.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-white">2. How We Use Your Data</h2>
            <p>
              Your data is exclusively utilized to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Coordinate timely scrap collections between citizens and verified local collectors.</li>
              <li>Provide accurate live GPS tracking during transit to your doorstep.</li>
              <li>Generate digital weight receipts and instant UPI payment receipts.</li>
              <li>Maintain carbon offset metrics and tree preservation milestones on your dashboard.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-white">3. Payout and Financial Information</h2>
            <p>
              We do not store bank passwords or UPI PINs. When you provide a UPI Virtual Payment Address (VPA) for doorstep scrap cashouts, it is used strictly for credit transfers upon doorstep weighing verification.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-white">4. Data Sharing & Security</h2>
            <p>
              We never sell or rent your personal information to third-party advertisers. Only assigned pickup partners receive your contact and address details solely for the duration of the scheduled collection slot.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-white">5. Contact Us</h2>
            <p>
              For data deletion requests or privacy inquiries, contact our grievance team at{" "}
              <a href="mailto:privacy@scrapsaathi.in" className="text-emerald-400 font-bold underline">
                privacy@scrapsaathi.in
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
