import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "../components/LoginContext";
import { api } from "../utils/api";
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOffice2Icon,
  ShieldCheckIcon,
  PencilSquareIcon,
  SparklesIcon,
  IdentificationIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export default function UserProfile() {
  const navigate = useNavigate();
  const { user } = useLogin();
  const [profile, setProfile] = useState({
    name: user?.name || "Scrap Citizen",
    email: user?.email || "",
    phone: user?.phone || "",
    userType: user?.userType || "individual",
    address: user?.address || "",
    companyName: user?.companyName || "",
    businessLicenseNo: user?.businessLicenseNo || "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await api.get("/v1/users/me");
        const data = response.data?.data?.user || response.data?.user || response.data;
        if (data) {
          setProfile((prev) => ({
            ...prev,
            ...data,
          }));
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const roleLabels = {
    individual: "Household Citizen",
    "waste-collector": "Verified Waste Collector",
    wasteCollector: "Verified Waste Collector",
    "big-organization": "Commercial B2B Enterprise",
    "recycle-company": "Authorized Recycling Facility",
    admin: "System Administrator",
    superAdmin: "Super Administrator",
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-8">
        
        {/* Header Hero Profile Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 shadow-xl">
              <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center text-4xl">
                👤
              </div>
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <ShieldCheckIcon className="w-3.5 h-3.5" />
                <span>{roleLabels[profile.userType] || "ScrapSaathi Member"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{profile.name}</h1>
              <p className="text-xs sm:text-sm text-slate-400">{profile.email}</p>
            </div>
          </div>

          <Link
            to="/editProfile"
            className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <PencilSquareIcon className="w-4 h-4 text-emerald-400" />
            <span>Edit Profile</span>
          </Link>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <EnvelopeIcon className="w-4 h-4 text-emerald-400" />
              <span>Email Address</span>
            </div>
            <p className="text-sm font-bold text-white font-mono">{profile.email || "Not Provided"}</p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <PhoneIcon className="w-4 h-4 text-emerald-400" />
              <span>Mobile Phone</span>
            </div>
            <p className="text-sm font-bold text-white font-mono">{profile.phone || "Not Provided"}</p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1.5 sm:col-span-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <MapPinIcon className="w-4 h-4 text-emerald-400" />
              <span>Registered Doorstep Address</span>
            </div>
            <p className="text-sm text-slate-200">{profile.address || "No saved address. Pin your home when scheduling pickups."}</p>
          </div>

          {profile.companyName && (
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1.5 sm:col-span-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <BuildingOffice2Icon className="w-4 h-4 text-teal-400" />
                <span>Company / Business Details</span>
              </div>
              <p className="text-sm font-bold text-white">{profile.companyName}</p>
              {profile.businessLicenseNo && (
                <p className="text-xs text-slate-400 font-mono">License: {profile.businessLicenseNo}</p>
              )}
            </div>
          )}
        </div>

        {/* Quick Navigation Links */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-white">Need to sell scrap right now?</p>
            <p className="text-xs text-slate-400">Book verified digital scale doorstep pickup in 30 seconds.</p>
          </div>
          <Link
            to="/sellWaste"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <span>Schedule Scrap Pickup</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
