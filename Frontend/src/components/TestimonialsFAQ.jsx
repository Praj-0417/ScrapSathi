import React, { useState } from "react";
import { ChevronDownIcon, StarIcon } from "@heroicons/react/24/solid";

export default function TestimonialsFAQ() {
  const [openFaq, setOpenFaq] = useState(null);

  const testimonials = [
    {
      name: "Rohit Sharma",
      location: "Gurugram, Sector 56",
      rating: 5,
      comment:
        "Scheduled an AC and 30kg raddi pickup. The executive arrived right on time with an electronic scale. Got ₹5,800 paid via UPI instantly. Much better experience than local vendors!",
      avatar: "👨‍💼",
    },
    {
      name: "Pooja Hegde",
      location: "Indiranagar, Bengaluru",
      rating: 5,
      comment:
        "Used ScrapSaathi for apartment deep cleaning before shifting. They took our old washing machine, cardboard boxes, and e-waste in one single go with zero hassle.",
      avatar: "👩‍💼",
    },
    {
      name: "Amitabh Verma",
      location: "Noida, Sector 62",
      rating: 5,
      comment:
        "Transparent rates shown on the website match 100% with what the pickup staff calculates. No bargaining needed, professional and polite staff.",
      avatar: "👨‍🏫",
    },
  ];

  const faqs = [
    {
      q: "Is there any minimum quantity required for free doorstep pickup?",
      a: "Yes, we require an estimated scrap weight of approximately 14-15 kg (or scrap items worth ₹200+ minimum value) to provide free doorstep pickup service.",
    },
    {
      q: "How do you ensure accurate weight measurement?",
      a: "Our pickup executives carry ISO certified electronic digital weighing scales. You can verify the calibration on the spot. We do not use old spring or iron beam balances.",
    },
    {
      q: "When and how will I receive payment for my scrap?",
      a: "Payment is made instantly on the spot! You can choose UPI (Google Pay, PhonePe, Paytm), Instant Bank Transfer, or Cash.",
    },
    {
      q: "What all scrap items do you buy?",
      a: "We buy Paper, Newspaper, Books, Cardboard, Plastics, Iron, Steel, Aluminium, Brass, Copper, Air Conditioners, Refrigerators, Washing Machines, Laptops, CPUs, Batteries, and End-of-Life Vehicles.",
    },
    {
      q: "Can I reschedule or cancel my booked pickup?",
      a: "Yes! You can easily reschedule or cancel your pickup anytime from your user dashboard or by replying to the SMS confirmation.",
    },
  ];

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <section className="py-20 bg-white text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Testimonials */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
              Customer Reviews
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
              Rated 4.9/5 by 45,000+ Customers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed italic">"{t.comment}"</p>
                </div>
                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-200/60">
                  <span className="text-2xl p-2 bg-white rounded-xl shadow-2xs">{t.avatar}</span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{t.name}</h4>
                    <p className="text-xs text-slate-500">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto pt-10 border-t border-slate-100">
          <div className="text-center mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
              Got Questions?
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50/50 transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex justify-between items-center gap-4 font-bold text-sm sm:text-base text-slate-900 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDownIcon
                      className={`w-5 h-5 text-emerald-600 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/50 pt-3 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
