import React, { useState } from "react";
import { useLogin } from "../components/LoginContext";
import { api } from "../utils/api";
import { toast } from "react-toastify";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  SparklesIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function Contact() {
  const { user } = useLogin();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    subject: "Doorstep Scrap Pickup Inquiry",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = "Please enter your full name (at least 2 characters)";
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Please enter a valid email address (e.g. name@example.com)";
    }
    if (formData.phone.trim() && !/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      errs.phone = "Please enter a valid 10-digit Indian mobile number";
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errs.message = "Message must be at least 10 characters long";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please resolve the highlighted form errors.");
      return;
    }

    setLoading(true);
    try {
      // Send to contact endpoint with fallback
      try {
        await api.post("/v1/contact", formData);
      } catch {
        await api.post("/form/contact", formData);
      }

      setSubmitted(true);
      toast.success("Thank you! Your message has been sent to our green support team.");
    } catch (err) {
      console.error("Contact submit error:", err);
      toast.error(err.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          className="animate-float-slow absolute top-10 right-1/4 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.35) 0%, transparent 70%)" }}
        />
        <div
          className="animate-float absolute bottom-10 left-10 w-96 h-96 rounded-full opacity-15"
          style={{ background: "radial-gradient(ellipse, rgba(6,182,212,0.3) 0%, transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(rgba(52,211,153,0.8) 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold backdrop-blur-md">
            <ChatBubbleLeftRightIcon className="w-4 h-4 text-emerald-400" />
            <span>24/7 Dedicated Support & Assistance</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            We're Here to Help You{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #34d399, #10b981, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Recycle Better
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Have questions about doorstep scrap pickup, live rates, bulk corporate recycling, or partnering with us? Reach out anytime.
          </p>
        </div>

        {/* 2-Column Layout: Contact Form & Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form Column */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-black text-white">Send Us a Direct Message</h2>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Avg Response: Under 2 Hours
              </span>
            </div>

            {submitted ? (
              <div className="p-8 text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <ShieldCheckIcon className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-white">Message Received!</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Our executive has logged your inquiry and will reach out via email or phone shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "", subject: "Doorstep Scrap Pickup Inquiry", message: "" });
                  }}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Your Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Rahul Sharma"
                      className={`w-full p-3.5 bg-slate-950 border rounded-2xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                        errors.name ? "border-rose-500 focus:ring-rose-500" : "border-slate-700 focus:ring-emerald-500"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-[11px] text-rose-400 font-semibold mt-1 flex items-center gap-1">
                        <ExclamationCircleIcon className="w-3.5 h-3.5" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. rahul@gmail.com"
                      className={`w-full p-3.5 bg-slate-950 border rounded-2xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                        errors.email ? "border-rose-500 focus:ring-rose-500" : "border-slate-700 focus:ring-emerald-500"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-[11px] text-rose-400 font-semibold mt-1 flex items-center gap-1">
                        <ExclamationCircleIcon className="w-3.5 h-3.5" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Mobile Number (Optional)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      maxLength={10}
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      className={`w-full p-3.5 bg-slate-950 border rounded-2xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                        errors.phone ? "border-rose-500 focus:ring-rose-500" : "border-slate-700 focus:ring-emerald-500"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-rose-400 font-semibold mt-1 flex items-center gap-1">
                        <ExclamationCircleIcon className="w-3.5 h-3.5" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Subject / Query Type
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-2xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Doorstep Scrap Pickup Inquiry">Doorstep Scrap Pickup Inquiry</option>
                      <option value="Bulk B2B Commercial Waste">Bulk B2B Commercial Scrap</option>
                      <option value="Rates & Pricing Clarification">Rates & Pricing Clarification</option>
                      <option value="Partner as Waste Collector">Partner as Waste Collector</option>
                      <option value="General Feedback">General Feedback & Suggestions</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Your Message <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your requirement or query in detail..."
                    className={`w-full p-3.5 bg-slate-950 border rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                      errors.message ? "border-rose-500 focus:ring-rose-500" : "border-slate-700 focus:ring-emerald-500"
                    }`}
                  />
                  {errors.message && (
                    <p className="text-[11px] text-rose-400 font-semibold mt-1 flex items-center gap-1">
                      <ExclamationCircleIcon className="w-3.5 h-3.5" />
                      {errors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>{loading ? "Sending Message..." : "Send Message to ScrapSaathi"}</span>
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Right Info Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl space-y-5">
              <h3 className="text-lg font-black text-white">Direct Contact Channels</h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <PhoneIcon className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">WhatsApp Support</p>
                    <p className="text-slate-400 font-mono mt-0.5">+91 98765 43210</p>
                    <p className="text-[10px] text-emerald-400 font-semibold">Mon - Sun: 8:00 AM - 9:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <EnvelopeIcon className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">Email Inquiries</p>
                    <p className="text-slate-400 font-mono mt-0.5">support@scrapsaathi.in</p>
                    <p className="text-[10px] text-teal-400 font-semibold">24/7 Monitored Mailbox</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <MapPinIcon className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">Headquarters & Tech Center</p>
                    <p className="text-slate-400 mt-0.5 leading-relaxed">
                      Delhi NCR, Bengaluru — Doorstep pickup across all zones
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Guarantee Callout */}
            <div className="p-6 rounded-3xl bg-emerald-950/30 border border-emerald-500/20 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <SparklesIcon className="w-4 h-4" />
                <span>Instant Doorstep Grievance Redressal</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                If you ever face an issue during doorstep collection or scale verification, our grievance officer responds within 30 minutes with full refund or scale re-verification.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
