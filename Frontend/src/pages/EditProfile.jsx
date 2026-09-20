import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "../components/LoginContext";
import { api } from "../utils/api";
import { toast } from "react-toastify";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOffice2Icon,
  ArrowRightIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, setUser } = useLogin();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    companyName: user?.companyName || "",
    businessLicenseNo: user?.businessLicenseNo || "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("/v1/users/me");
        const data = response.data?.data?.user || response.data?.user || response.data;
        if (data) {
          setFormData({
            name: data.name || "",
            phone: data.phone || "",
            address: data.address || "",
            companyName: data.companyName || "",
            businessLicenseNo: data.businessLicenseNo || "",
          });
        }
      } catch (err) {
        console.error("Fetch profile error:", err);
      }
    };
    fetchUserData();
  }, []);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = "Full name must be at least 2 characters";
    }
    if (formData.phone.trim() && !/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      errs.phone = "Enter a valid 10-digit Indian mobile number";
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
      toast.error("Please resolve the highlighted errors.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        companyName: formData.companyName.trim() || undefined,
        businessLicenseNo: formData.businessLicenseNo.trim() || undefined,
      };

      const res = await api.patch("/v1/users/me", payload);
      const updatedUser = res.data?.data?.user || res.data?.user || { ...user, ...payload };
      if (setUser) {
        setUser(updatedUser);
      }

      toast.success("Profile updated successfully!");
      navigate("/profile");
    } catch (err) {
      console.error("Profile update error:", err);
      const msg = err.response?.data?.message || "Failed to update profile. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
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
          className="animate-float-slow absolute top-10 left-1/3 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.35) 0%, transparent 70%)" }}
        />
        <div
          className="animate-float absolute bottom-10 right-10 w-96 h-96 rounded-full opacity-15"
          style={{ background: "radial-gradient(ellipse, rgba(6,182,212,0.3) 0%, transparent 70%)" }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 relative z-10 space-y-8">
        
        {/* Header Hero */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold backdrop-blur-md">
            <SparklesIcon className="w-4 h-4 text-emerald-400" />
            <span>Account Preferences</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Edit Your Profile</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Update your registered name, contact number, and default doorstep collection address.
          </p>
        </div>

        {/* Edit Form Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Priya Sharma"
                  className={`w-full p-3.5 pl-10 bg-slate-950 border rounded-2xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.name ? "border-rose-500 focus:ring-rose-500" : "border-slate-700 focus:ring-emerald-500"
                  }`}
                />
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              {errors.name && (
                <p className="text-[11px] text-rose-400 font-semibold mt-1 flex items-center gap-1">
                  <ExclamationCircleIcon className="w-3.5 h-3.5" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Mobile Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Mobile Number (10 Digits)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className={`w-full p-3.5 pl-10 bg-slate-950 border rounded-2xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.phone ? "border-rose-500 focus:ring-rose-500" : "border-slate-700 focus:ring-emerald-500"
                  }`}
                />
                <PhoneIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              {errors.phone && (
                <p className="text-[11px] text-rose-400 font-semibold mt-1 flex items-center gap-1">
                  <ExclamationCircleIcon className="w-3.5 h-3.5" />
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Default Address */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Default Doorstep Address & Landmark
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House/Flat No, Apartment name, Street, Landmark, City & Pincode"
                  className="w-full p-3.5 pl-10 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <MapPinIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-4" />
              </div>
            </div>

            {/* Company / Business Details if applicable */}
            {(user?.userType !== "individual" || formData.companyName) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Company Pvt Ltd"
                    className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-2xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Business License / GSTIN
                  </label>
                  <input
                    type="text"
                    name="businessLicenseNo"
                    value={formData.businessLicenseNo}
                    onChange={handleChange}
                    placeholder="07AAAAA0000A1Z5"
                    className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-2xl text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-800">
              <Link
                to="/profile"
                className="flex-1 py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center transition-colors border border-slate-700"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <span>{isSubmitting ? "Saving Changes..." : "Save Profile"}</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
