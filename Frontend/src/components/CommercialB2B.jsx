import React from "react";
import { Link } from "react-router-dom";
import {
  BuildingOffice2Icon,
  HomeModernIcon,
  WrenchScrewdriverIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export default function CommercialB2B() {
  const solutions = [
    {
      title: "For Households & Apartments",
      desc: "Doorstep scrap pickup for old newspapers, carton boxes, copper, appliances, and broken furniture at live rates with zero hassle.",
      icon: <HomeModernIcon className="w-8 h-8 text-emerald-600" />,
      cta: "Book Home Pickup",
      link: "/sellWaste",
      badge: "Zero Booking Fee",
    },
    {
      title: "For Residential Societies (RWA)",
      desc: "Organized weekend scrap collection drives in your society premises with dedicated trucks, on-spot digital weighing, and cash payouts.",
      icon: <BuildingOffice2Icon className="w-8 h-8 text-blue-600" />,
      cta: "Schedule Society Drive",
      link: "/contact",
      badge: "Society Drives",
    },
    {
      title: "For Corporates & Commercial",
      desc: "Certified E-Waste dismantling, IT asset disposition (ITAD), office de-cluttering, and scrap clearance with green recycling certificates & GST invoices.",
      icon: <WrenchScrewdriverIcon className="w-8 h-8 text-purple-600" />,
      cta: "Corporate Tie-Up",
      link: "/contact",
      badge: "E-Waste / GST Invoice",
    },
  ];

  return (
    <section className="py-20 bg-slate-50 text-slate-900 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
            Tailored Solutions
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
            Scrap Solutions for Everyone
          </h2>
          <p className="text-base text-slate-600 mt-2">
            Whether you have 15 kg of old books at home or 10 tons of industrial metal scrap, we have dedicated vehicles and teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {solutions.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg hover:border-emerald-400 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-3">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-8">{item.desc}</p>
              </div>

              <Link
                to={item.link}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-emerald-600 text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition-all duration-200"
              >
                <span>{item.cta}</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
