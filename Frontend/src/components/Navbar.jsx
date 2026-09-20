import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useLogin } from "./LoginContext";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/rates", label: "Scrap Rates", badge: "Live", icon: <SparklesIcon className="w-3.5 h-3.5 text-emerald-400" /> },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/learning", label: "Learning" },
  { to: "/contact", label: "Contact" },
];

function getDashboardPath(user) {
  if (user?.userType === "waste-collector") return "/waste-collector-dashboard";
  if (user?.userType === "big-organization") return "/organization-dashboard";
  if (user?.userType === "recycle-company") return "/recycle-company-dashboard";
  return "/individual-dashboard";
}

export default function Navbar() {
  const { loggedIn, user, logout } = useLogin();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => { setIsOpen(false); setUserMenuOpen(false); }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className="fixed z-50 top-0 left-0 w-full transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(3, 10, 20, 0.95)"
          : "rgba(2, 13, 24, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(255,255,255,0.04)",
        boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.3)" : "none",
        padding: scrolled ? "12px 0" : "16px 0",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
              style={{
                background: "linear-gradient(135deg, #059669, #10b981)",
                boxShadow: "0 4px 16px rgba(16,185,129,0.3)",
              }}
            >
              ♻️
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black tracking-tight text-white leading-none">
                Scrap<span style={{ color: "#34d399" }}>Saathi</span>
              </div>
              <div className="text-[9px] tracking-[0.18em] font-bold uppercase text-slate-500 mt-0.5">
                Online Scrap Collection
              </div>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                  isActive(link.to)
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
                {link.badge && (
                  <span
                    className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md"
                    style={{
                      background: "rgba(16,185,129,0.15)",
                      color: "#34d399",
                      border: "1px solid rgba(16,185,129,0.25)",
                    }}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* ── Desktop Right CTA ── */}
          <div className="hidden lg:flex items-center gap-2.5">
            {loggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all hover:bg-white/5 text-slate-300 hover:text-white"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                    style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff" }}
                  >
                    {(user?.name?.[0] || "U").toUpperCase()}
                  </div>
                  <span className="text-sm font-bold">{user?.name?.split(" ")[0] || "User"}</span>
                  <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-52 rounded-2xl py-2 shadow-2xl"
                    style={{
                      background: "rgba(10,15,30,0.95)",
                      backdropFilter: "blur(16px)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="px-4 py-2 border-b mb-1" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      <div className="text-xs font-black text-white truncate">{user?.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
                    </div>
                    <Link
                      to={getDashboardPath(user)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <UserCircleIcon className="w-4 h-4" />
                      My Dashboard
                    </Link>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white transition-colors rounded-xl hover:bg-white/5"
              >
                Login
              </Link>
            )}

            <Link
              to="/sellWaste"
              className="px-5 py-2.5 text-sm font-black rounded-xl flex items-center gap-2 transition-all duration-200 hover:scale-[1.04] active:scale-98 text-slate-950"
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                boxShadow: "0 4px 16px rgba(16,185,129,0.3)",
              }}
            >
              <CalendarDaysIcon className="w-4 h-4" />
              <span>Book Pickup</span>
            </Link>
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>

        {/* ── Mobile Drawer ── */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="pt-4 pb-5 mt-4 space-y-1" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive(link.to)
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-200 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">{link.icon}{link.label}</span>
                {link.badge && (
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md"
                    style={{ background: "#10b981", color: "#022c22" }}>
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}

            <div className="pt-3 mt-2 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <Link
                to="/sellWaste"
                onClick={() => setIsOpen(false)}
                className="w-full py-3.5 font-black rounded-xl flex items-center justify-center gap-2 text-sm text-slate-950 transition-all active:scale-98"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
              >
                <CalendarDaysIcon className="w-4 h-4" />
                Book Doorstep Pickup
              </Link>

              {loggedIn ? (
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-xs font-bold text-slate-400">
                    Hi, <span className="text-white">{user?.name?.split(" ")[0]}</span>
                  </span>
                  <button
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full py-3 text-center font-bold rounded-xl text-sm text-slate-300 transition-all hover:text-white"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  Login / Signup
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
