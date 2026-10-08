import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { toast } from "react-toastify";
import { useLogin } from "../components/LoginContext";
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ExclamationCircleIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
  HomeIcon,
  BuildingOffice2Icon,
  TruckIcon,
  ArrowPathRoundedSquareIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function Register() {
  const { login } = useLogin();
  const navigate = useNavigate();

  const [userType, setUserType] = useState("individual");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    termsAccepted: true,
    companyName: "",
    businessLicenseNo: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Google OAuth state
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [customGoogleName, setCustomGoogleName] = useState("");
  const [enteredClientId, setEnteredClientId] = useState(
    import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem("scrapsaathi_google_client_id") || ""
  );

  const redirectByUserRole = (userObj) => {
    if (userObj?.role === "admin" || userObj?.userType === "admin" || userObj?.userType === "superAdmin") {
      navigate("/AdvancedDashboard");
    } else if (userObj?.userType === "waste-collector" || userObj?.userType === "wasteCollector") {
      navigate("/collector-dashboard");
    } else if (userObj?.userType === "big-organization") {
      navigate("/organization-dashboard");
    } else if (userObj?.userType === "recycle-company") {
      navigate("/recycle-company-dashboard");
    } else {
      navigate("/individual-dashboard");
    }
  };

  // Authenticate with backend using either real Google Credential JWT or Google profile
  const executeGoogleAuth = async (authPayload) => {
    setIsGoogleLoading(true);
    try {
      const response = await api.post("/v1/auth/google", authPayload);
      const token = response.data?.data?.token || response.data?.token;
      const userObj = response.data?.data?.user || response.data?.user;

      if (token) {
        await login(token, userObj);
        toast.success(`Google registration successful! Welcome, ${userObj?.name || "Eco Champion"}`);
        setShowGoogleModal(false);
        redirectByUserRole(userObj);
      }
    } catch (err) {
      console.error("Google Auth error:", err);
      toast.error(err.response?.data?.message || "Google registration failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Initialize official Google Identity Services
  useEffect(() => {
    const activeClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!activeClientId) return;

    const setupGIS = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: activeClientId,
            callback: (res) => {
              if (res.credential) {
                executeGoogleAuth({ credential: res.credential });
              }
            },
          });

          const container = document.getElementById("googleSignUpDiv");
          if (container) {
            window.google.accounts.id.renderButton(container, {
              theme: "filled_blue",
              size: "large",
              width: 320,
              text: "signup_with",
              shape: "rectangular",
            });
          }
        } catch (e) {
          console.warn("GIS initialization notice:", e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      setupGIS();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          setupGIS();
          clearInterval(interval);
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, []);

  const handleGoogleBtnClick = () => {
    const activeClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!activeClientId) {
      toast.error("Google Client ID is not configured in .env");
      return;
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  };

  const userRoles = [
    { key: "individual", label: "Household Citizen", icon: UserIcon, desc: "Sell household scrap & get paid instantly" },
    { key: "waste-collector", label: "Waste Collector", icon: TruckIcon, desc: "Accept doorstep requests & earn daily" },
    { key: "big-organization", label: "Commercial B2B", icon: BuildingOffice2Icon, desc: "Bulk corporate scrap & EPR compliance" },
    { key: "recycle-company", label: "Recycling Plant", icon: ArrowPathRoundedSquareIcon, desc: "Procure sorted industrial recyclable materials" },
  ];

  const validate = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = "Full name must be at least 2 characters";
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Please enter a valid email address";
    }
    if (!formData.phone.trim() || !/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      errs.phone = "Enter a valid 10-digit Indian mobile number (e.g. 9876543210)";
    }
    if (!formData.password || formData.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    if (!formData.termsAccepted) {
      errs.terms = "You must accept the terms & privacy policy";
    }
    if (userType !== "individual" && !formData.companyName.trim()) {
      errs.companyName = "Company or Enterprise name is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        userType,
        termsAccepted: formData.termsAccepted,
        address: formData.address.trim() || undefined,
        companyName: formData.companyName.trim() || undefined,
        businessLicenseNo: formData.businessLicenseNo.trim() || undefined,
      };

      const res = await api.post("/v1/auth/register", payload);
      const token = res.data?.data?.token || res.data?.token;
      const userObj = res.data?.data?.user || res.data?.user;

      if (token) {
        await login(token, userObj);
        toast.success(`Account created successfully! Welcome, ${userObj?.name || "Eco Champion"}!`);
        redirectByUserRole(userObj || { userType });
      } else {
        toast.success("Account created! Please sign in.");
        navigate("/login");
      }
    } catch (err) {
      console.error("Registration error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        "Registration failed. Please check your details.";
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
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Background Orbs */}
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-8">
        
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold backdrop-blur-md">
            <SparklesIcon className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Join 45,000+ Verified Recyclers Across India</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Create Your ScrapSaathi Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Select your account type, start selling recyclable scrap, and track doorstep collections live.
          </p>
        </div>

        {/* Role Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {userRoles.map((role) => {
            const Icon = role.icon;
            const isSelected = userType === role.key;
            return (
              <button
                key={role.key}
                type="button"
                onClick={() => setUserType(role.key)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? "bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10"
                    : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? "text-emerald-400" : "text-slate-400"}`} />
                <div>
                  <p className="text-xs font-black text-white">{role.label}</p>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{role.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Registration Form Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Legal Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInput}
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

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInput}
                    placeholder="priya@example.com"
                    className={`w-full p-3.5 pl-10 bg-slate-950 border rounded-2xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                      errors.email ? "border-rose-500 focus:ring-rose-500" : "border-slate-700 focus:ring-emerald-500"
                    }`}
                  />
                  <EnvelopeIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-400 font-semibold mt-1 flex items-center gap-1">
                    <ExclamationCircleIcon className="w-3.5 h-3.5" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Mobile Number (10 Digits) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    maxLength={10}
                    required
                    value={formData.phone}
                    onChange={handleInput}
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

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password (Min 6 Characters) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInput}
                    placeholder="••••••••"
                    className={`w-full p-3.5 pl-10 pr-12 bg-slate-950 border rounded-2xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                      errors.password ? "border-rose-500 focus:ring-rose-500" : "border-slate-700 focus:ring-emerald-500"
                    }`}
                  />
                  <LockClosedIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-400 font-semibold mt-1 flex items-center gap-1">
                    <ExclamationCircleIcon className="w-3.5 h-3.5" />
                    {errors.password}
                  </p>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Address / Area
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInput}
                  placeholder="Street / Society / City & Pincode"
                  className="w-full p-3.5 pl-10 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <HomeIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Conditional Business Fields for Organizations */}
            {userType !== "individual" && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 animate-fade-in">
                <p className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                  Organization / Commercial Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Organization / Company Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInput}
                      placeholder="Company Pvt Ltd"
                      className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {errors.companyName && (
                      <p className="text-[11px] text-rose-400 font-semibold mt-1">{errors.companyName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      GSTIN / Business License No
                    </label>
                    <input
                      type="text"
                      name="businessLicenseNo"
                      value={formData.businessLicenseNo}
                      onChange={handleInput}
                      placeholder="e.g. 07AAAAA0000A1Z5"
                      className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2.5 pt-2">
              <input
                type="checkbox"
                id="termsAccepted"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleInput}
                className="w-4 h-4 mt-0.5 accent-emerald-500 rounded cursor-pointer"
              />
              <label htmlFor="termsAccepted" className="text-xs text-slate-400 leading-relaxed cursor-pointer">
                I agree to ScrapSaathi's <Link to="/terms" className="text-emerald-400 font-bold hover:underline">Terms of Service</Link>, <Link to="/privacy-policy" className="text-emerald-400 font-bold hover:underline">Privacy Policy</Link>, and verified scale weighment protocols.
              </label>
            </div>
            {errors.terms && (
              <p className="text-[11px] text-rose-400 font-semibold flex items-center gap-1">
                <ExclamationCircleIcon className="w-3.5 h-3.5" />
                {errors.terms}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>{isSubmitting ? "Creating Account..." : "Create Account & Start Recycling"}</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </form>

          {/* OR Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Or quick register with
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Official Google Button Container */}
          <div id="googleSignUpDiv" className="w-full flex justify-center min-h-[44px]"></div>

          <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-400 font-bold hover:underline">
              Sign In Here →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
