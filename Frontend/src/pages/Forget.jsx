import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { toast } from 'react-toastify';
import {
  EnvelopeIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/v1/auth/otp/send-reset', { email: email.trim().toLowerCase() });
      if (res.status === 200 || res.data?.success) {
        toast.success('OTP sent! Check your email inbox.');
        navigate('/updatePassword', { state: { email: email.trim().toLowerCase() } });
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 404) {
        toast.error('No account found with this email. Please sign up first.');
      } else if (status === 429) {
        toast.error('Too many attempts. Please try again in a few minutes.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to send OTP. Please try again.');
      }
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
            🔑
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            <span>Secure OTP Reset</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Forgot Password?</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enter your registered email and we'll send a one-time password (OTP) to reset your account.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <EnvelopeIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="name@example.com"
                className="w-full p-3.5 pl-10 bg-slate-950 border border-slate-700 rounded-2xl text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>{isSubmitting ? 'Sending OTP...' : 'Send OTP to Email'}</span>
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
