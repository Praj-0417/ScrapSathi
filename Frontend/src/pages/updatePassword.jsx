import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api';
import { toast } from 'react-toastify';
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  LockClosedIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

export default function UpdatePassword() {
  const location = useLocation();
  const otpEmail = location.state?.email ?? localStorage.getItem('forgotpassEmail') ?? '';

  const [formData, setFormData] = useState({
    email: otpEmail,
    otp: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!formData.otp.trim() || formData.otp.trim().length !== 6) {
      toast.error('Please enter the 6-digit OTP sent to your email.');
      return false;
    }
    if (!formData.password || formData.password.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      let res;
      try {
        res = await api.post('/v1/auth/password/reset', formData);
      } catch {
        res = await api.post('/v1/auth/update', formData);
      }

      if (res.data?.success || res.status === 200) {
        localStorage.removeItem('forgotpassEmail');
        toast.success('Password updated successfully! Please log in.');
        navigate('/login');
      } else {
        toast.error('Failed to update password. Please try again.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid OTP or the OTP has expired.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 selection:bg-emerald-500 selection:text-white"
      style={{ background: 'linear-gradient(145deg, #020d18 0%, #051a14 30%, #0a1628 60%, #071a1a 100%)' }}
    >
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6 text-white">

        {/* Header */}
        <div className="text-center space-y-2">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-xl"
            style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 12px 32px rgba(16,185,129,0.35)' }}
          >
            🔐
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            <span>OTP Verified Reset</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Set New Password</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enter the OTP sent to <strong className="text-emerald-400">{otpEmail || 'your email'}</strong> and choose a new password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email (readonly) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              readOnly
              value={formData.email}
              className="w-full p-3.5 bg-slate-950/50 border border-slate-700/50 rounded-2xl text-sm font-bold text-slate-500 cursor-not-allowed"
            />
          </div>

          {/* OTP */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              OTP <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <KeyIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showOTP ? 'text' : 'password'}
                name="otp"
                required
                value={formData.otp}
                onChange={handleChange}
                placeholder="Enter OTP from email"
                className="w-full p-3.5 pl-10 pr-12 bg-slate-950 border border-slate-700 rounded-2xl text-sm font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowOTP(!showOTP)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {showOTP ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              New Password <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <LockClosedIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                className="w-full p-3.5 pl-10 pr-12 bg-slate-950 border border-slate-700 rounded-2xl text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 pl-1">Minimum 6 characters</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>{isSubmitting ? 'Updating Password...' : 'Update Password'}</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors">
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
