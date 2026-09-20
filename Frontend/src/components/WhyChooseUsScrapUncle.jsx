import React from "react";
import {
  ScaleIcon,
  CurrencyRupeeIcon,
  UserGroupIcon,
  GlobeAmericasIcon,
  ClockIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function WhyChooseUsScrapUncle() {
  const benefits = [
    {
      title: "ISO Standard Digital Weighing",
      desc: "We bring certified electronic weighing scales with high accuracy, ensuring 100% transparent weight and zero cheating.",
      icon: <ScaleIcon className="w-7 h-7 text-emerald-600" />,
      tag: "100% Accurate",
    },
    {
      title: "Best Market Price Guarantee",
      desc: "Get real-time updated fair prices for newspaper, metals, electronics, and heavy appliances with zero hidden deductions.",
      icon: <CurrencyRupeeIcon className="w-7 h-7 text-emerald-600" />,
      tag: "Live Rates",
    },
    {
      title: "Instant UPI & Cash Payout",
      desc: "Money is transferred directly to your GooglePay, PhonePe, Paytm, or Bank Account on the spot before we leave your premises.",
      icon: <ClockIcon className="w-7 h-7 text-emerald-600" />,
      tag: "Instant Payout",
    },
    {
      title: "Verified & Uniformed Staff",
      desc: "All our pickup executives undergo rigorous background checks, police verification, and customer service training for safety.",
      icon: <ShieldCheckIcon className="w-7 h-7 text-emerald-600" />,
      tag: "Safe for Home",
    },
    {
      title: "Zero Landfill Eco-Recycling",
      desc: "Every kilogram of scrap collected is responsibly segregated and routed to certified recyclers to prevent landfill dumping.",
      icon: <GlobeAmericasIcon className="w-7 h-7 text-emerald-600" />,
      tag: "Eco Friendly",
    },
    {
      title: "Society & Bulk Scrap Drives",
      desc: "Specialized pickup trucks and bulk collection support for residential societies, IT offices, factories, and schools.",
      icon: <UserGroupIcon className="w-7 h-7 text-emerald-600" />,
      tag: "Bulk & B2B",
    },
  ];

  return (
    <section className="py-20 bg-white text-slate-900 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
            Why Customers Trust ScrapSaathi
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
            Why Choose ScrapSaathi Over Traditional Kabadiwala?
          </h2>
          <p className="text-base text-slate-600 mt-2">
            We are revolutionizing India's unorganized recycling sector through technology, trust, and transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-emerald-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center">
                    {benefit.icon}
                  </div>
                  <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg">
                    {benefit.tag}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
