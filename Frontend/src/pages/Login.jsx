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
  LockClosedIcon,
  EnvelopeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function Login() {
  const { login } = useLogin();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
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
        toast.success(`Google authentication successful! Welcome, ${userObj?.name || "Eco Champion"}`);
        setShowGoogleModal(false);
        redirectByUserRole(userObj);
      }
    } catch (err) {
      console.error("Google Auth error:", err);
      toast.error(err.response?.data?.message || "Google authentication failed. Please try again.");
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

          const container = document.getElementById("googleSignInDiv");
          if (container) {
            window.google.accounts.id.renderButton(container, {
              theme: "filled_blue",
              size: "large",
              width: 320,
              text: "continue_with",
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

  const validate = () => {
    const errs = {};
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Please enter a valid email address";
    }
    if (!formData.password || formData.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please enter valid email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/v1/auth/login", formData);
      const token = response.data?.data?.token || response.data?.token;
      const userObj = response.data?.data?.user || response.data?.user;

      if (token) {
        await login(token, userObj);
        toast.success(`Welcome back, ${userObj?.name || "Eco Champion"}!`);
        redirectByUserRole(userObj);
      }
    } catch (err) {
      console.error("Login error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        "Invalid email or password. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex text-slate-100 selection:bg-emerald-500 selection:text-white relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #020d18 0%, #051a14 30%, #0a1628 60%, #071a1a 100%)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* ── Left Hero Panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-16 text-white border-r border-slate-800/80">
        {/* Glow Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="animate-float-slow absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full opacity-25"
            style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.5) 0%, transparent 70%)" }}
          />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(rgba(52,211,153,0.9) 1px, transparent 1px)", backgroundSize: "32px 32px" }}
          />
        </div>

        <div className="relative text-center max-w-md space-y-6">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-2xl"
            style={{ background: "linear-gradient(135deg, #059669, #10b981)", boxShadow: "0 16px 48px rgba(16,185,129,0.4)" }}
          >
            ♻️
          </div>

          <h1 className="text-4xl font-black tracking-tight text-white">
            Scrap<span className="text-emerald-400">Saathi</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            India's most trusted smart doorstep scrap collection platform. Calibrated digital weighing, instant UPI payments, and live vehicle tracking.
          </p>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { icon: "⚡", label: "Instant UPI Payout" },
              { icon: "🛡️", label: "Verified Staff" },
              { icon: "⚖️", label: "Digital ISO Scales" },
              { icon: "🌿", label: "Zero Landfill" },
            ].map((b, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-3.5 rounded-2xl text-xs font-bold text-slate-300 bg-slate-900/80 border border-slate-800"
              >
                <span>{b.icon}</span>
                <span>{b.label}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
            <span>Trusted by <strong className="text-white font-bold">45,000+</strong> eco-conscious households</span>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Modern Dark Glassmorphic Login Form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-28 relative z-10">
        <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6">
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-3">
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>Secure Citizen Login</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Welcome Back</h2>
            <p className="text-slate-400 mt-1 text-xs sm:text-sm">Sign in to track pickups & view your green earnings</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInput}
                  disabled={isSubmitting}
                  required
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

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Password</label>
                <Link to="/forgotPassword" className="text-xs font-bold text-emerald-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInput}
                  disabled={isSubmitting}
                  required
                  className={`w-full p-3.5 pl-10 pr-12 bg-slate-950 border rounded-2xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.password ? "border-rose-500 focus:ring-rose-500" : "border-slate-700 focus:ring-emerald-500"
                  }`}
                />
                <LockClosedIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>{isSubmitting ? "Authenticating..." : "Sign In to ScrapSaathi"}</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </form>

          {/* OR Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Or continue with
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Official Google OAuth Button rendered by Google SDK */}
          <div id="googleSignInDiv" className="w-full flex justify-center min-h-[44px]"></div>

          <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
            Don't have an account yet?{" "}
            <Link to="/register" className="text-emerald-400 font-bold hover:underline">
              Create an Account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
