import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  BriefcaseIcon,
  TruckIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  XMarkIcon,
  PhoneIcon,
  UserIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

const ROLES = [
  {
    id: "collector",
    title: "Doorstep Scrap Collector Partner",
    type: "Full-Time / Part-Time (Gig)",
    earnings: "₹25,000 – ₹45,000 / month",
    payout: "Daily UPI Settlement",
    city: "Delhi NCR & Bengaluru",
    description:
      "Pick up household and commercial scrap using our digital weighing system. Connect with pre-verified local customer requests in your pin code.",
    perks: [
      "Keep 100% of doorstep collection margins",
      "Instant daily payouts to your UPI",
      "Digital Bluetooth weighing scale support",
      "Branded uniform and safety kits provided",
    ],
    requirements: "Smartphone with GPS, two-wheeler or three-wheeler (or foot cart), valid Aadhaar card.",
  },
  {
    id: "driver",
    title: "Electric Fleet Logistics Driver",
    type: "Full-Time",
    earnings: "₹22,000 – ₹32,000 / month",
    payout: "Monthly Fixed + Trip Bonus",
    city: "Delhi NCR (Noida, Ghaziabad, Gurugram)",
    description:
      "Drive ScrapSaathi EV collection vehicles to pick up bulk recyclable scrap from residential societies, IT parks, and commercial warehouses.",
    perks: [
      "Company-provided EV three-wheelers",
      "Fuel/charging fully covered by ScrapSaathi",
      "Accidental medical insurance coverage",
      "Consistent fixed route schedules",
    ],
    requirements: "Valid Commercial Driving License (LCV/Three-Wheeler), minimum 1 year commercial driving experience.",
  },
  {
    id: "ewaste-specialist",
    title: "E-Waste Dismantling Technician",
    type: "Full-Time",
    earnings: "₹24,000 – ₹35,000 / month",
    payout: "Monthly Fixed",
    city: "Greater Noida Processing Facility",
    description:
      "Safely disassemble, test, categorize, and sort electronic waste (appliances, PCs, circuit boards) in our certified eco-recycling facility.",
    perks: [
      "State-of-the-art safety gear & ventilation",
      "Certified CPCB hazardous material training",
      "Yearly performance appraisals",
      "Free transit from select metro stations",
    ],
    requirements: "ITI or diploma in Electrical/Electronics, or 1+ year practical appliance repair/dismantling experience.",
  },
  {
    id: "coordinator",
    title: "Neighborhood Society Coordinator",
    type: "Contract / Commission",
    earnings: "₹18,000 – ₹30,000 / month",
    payout: "Per-Drive Commission",
    city: "All Operating Cities",
    description:
      "Partner with Resident Welfare Associations (RWAs) and apartment societies to organize Sunday scrap recycling drives and e-waste drop-offs.",
    perks: [
      "Work purely on weekends or flexible hours",
      "Direct bonus per metric ton collected",
      "Community leadership recognition",
      "Marketing collaterals and event banners provided",
    ],
    requirements: "Strong communication and relationship-building skills. Active resident in a housing society is a plus.",
  },
];

export default function Jobs() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    city: "delhi-ncr",
    experience: "1-2 years",
    vehicle: "two-wheeler",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApply = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || formData.phone.trim().length < 10) {
      toast.error("Please provide your name and a valid 10-digit phone number.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        `Application submitted for ${selectedRole?.title || "Partner Role"}! Our recruitment team will call you within 24 hours.`
      );
      setSelectedRole(null);
      setFormData({
        fullName: "",
        phone: "",
        city: "delhi-ncr",
        experience: "1-2 years",
        vehicle: "two-wheeler",
      });
    }, 900);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-28 pb-20 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <SparklesIcon className="w-4 h-4" />
            <span>Green Jobs & Partner Opportunities</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Earn With Pride. <br className="hidden sm:inline" />
            Join the <span className="text-emerald-400">ScrapSaathi</span> Network.
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Whether you want daily high-margin doorstep scrap collections or stable facility roles, ScrapSaathi offers transparent earnings, dignified work, and instant digital payments.
          </p>
        </div>

        {/* Benefits Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: CurrencyRupeeIcon, title: "Daily UPI Payouts", desc: "No waiting for weeks — earn doorstep cash or UPI instantly" },
            { icon: ClockIcon, title: "Flexible Schedules", desc: "Work full-time or pick up nearby gigs on weekends" },
            { icon: ShieldCheckIcon, title: "Verified Customer Leads", desc: "Real pickups mapped to your nearby GPS radius" },
            { icon: SparklesIcon, title: "Dignified Platform", desc: "Uniforms, certified digital scales, and safety equipment" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/30 transition-all flex flex-col items-start gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">{item.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Open Roles Listing */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <BriefcaseIcon className="w-6 h-6 text-emerald-400" />
              <span>Available Openings & Partner Roles</span>
            </h2>
            <span className="text-xs font-bold text-slate-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
              {ROLES.length} Roles Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ROLES.map((role) => (
              <div
                key={role.id}
                className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all shadow-xl flex flex-col justify-between gap-6"
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {role.type}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <MapPinIcon className="w-3.5 h-3.5 text-emerald-400" />
                      {role.city}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-white">{role.title}</h3>
                    <p className="text-sm font-black text-emerald-400 mt-1">{role.earnings}</p>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{role.description}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <h4 className="text-xs font-bold uppercase text-slate-300 tracking-wider">Perks & Benefits:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {role.perks.map((p, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-slate-300">
                          <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedRole(role)}
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
                >
                  <span>Apply for this Role</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp Fast Track CTA */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-black text-white">Prefer to apply directly over WhatsApp?</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Send your Name, City, and Vehicle type to our hiring helpline. Our recruiter will schedule your onboarding immediately.
            </p>
          </div>
          <a
            href="https://wa.me/919876543210?text=Hi%20ScrapSaathi%2C%20I%20want%20to%20apply%20as%20a%20Scrap%20Collector%20Partner."
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-emerald-500/30 transition-transform hover:scale-105 shrink-0"
          >
            <PhoneIcon className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Application Modal */}
      {selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl text-slate-100">
            <button
              onClick={() => setSelectedRole(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="space-y-1 mb-6">
              <span className="text-[11px] font-black uppercase text-emerald-400 tracking-wider">Fast-Track Application</span>
              <h3 className="text-xl font-black text-white">{selectedRole.title}</h3>
              <p className="text-xs text-slate-400">{selectedRole.earnings} • {selectedRole.city}</p>
            </div>

            <form onSubmit={handleApply} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Full Name *</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Mobile Number (WhatsApp) *</label>
                <div className="relative">
                  <PhoneIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Operating City</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="delhi-ncr">Delhi NCR</option>
                    <option value="noida">Noida / Greater Noida</option>
                    <option value="ghaziabad">Ghaziabad</option>
                    <option value="gurugram">Gurugram</option>
                    <option value="bengaluru">Bengaluru</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Vehicle Available</label>
                  <select
                    value={formData.vehicle}
                    onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="two-wheeler">Bike / Motorcycle</option>
                    <option value="three-wheeler">Auto / E-Rickshaw</option>
                    <option value="commercial">Mini Truck / Tempo</option>
                    <option value="cycle-cart">Cycle Cart</option>
                    <option value="none">No Vehicle (Walking/Helper)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                {isSubmitting ? "Submitting Application..." : "Submit Application"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
