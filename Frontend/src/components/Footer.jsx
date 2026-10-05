import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { MapPinIcon, PhoneIcon, EnvelopeIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <span className="text-xl">♻️</span>
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Scrap<span className="text-emerald-400">Saathi</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              India's leading online scrap pickup service. We provide transparent digital weighing, instant UPI payments, and 100% eco-friendly recycling right at your doorstep.
            </p>

            <div className="pt-2 flex items-center gap-4 text-slate-400">
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp ScrapSaathi" className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors">
                <FaWhatsapp size={18} />
              </a>
              <a href="https://instagram.com/scrapsaathi" target="_blank" rel="noopener noreferrer" aria-label="Instagram ScrapSaathi" className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors">
                <FaInstagram size={18} />
              </a>
              <a href="https://linkedin.com/company/scrapsaathi" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn ScrapSaathi" className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors">
                <FaLinkedin size={18} />
              </a>
              <a href="https://twitter.com/scrapsaathi" target="_blank" rel="noopener noreferrer" aria-label="Twitter ScrapSaathi" className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors">
                <FaTwitter size={18} />
              </a>
            </div>
          </div>

          {/* Col 2: Scrap Rates & Services */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-200 mb-4">
              Scrap Rates
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400 font-medium">
              <li>
                <Link to="/rates" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <SparklesIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Live Price List</span>
                </Link>
              </li>
              <li>
                <Link to="/rates" className="hover:text-emerald-400 transition-colors">
                  Normal Recyclables
                </Link>
              </li>
              <li>
                <Link to="/rates" className="hover:text-emerald-400 transition-colors">
                  Large Appliances (AC/Fridge)
                </Link>
              </li>
              <li>
                <Link to="/rates" className="hover:text-emerald-400 transition-colors">
                  E-Waste & Laptops
                </Link>
              </li>
              <li>
                <Link to="/rates" className="hover:text-emerald-400 transition-colors">
                  Vehicle Scrapping
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Company & Solutions */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-200 mb-4">
              Solutions
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400 font-medium">
              <li>
                <Link to="/sellWaste" className="hover:text-emerald-400 transition-colors">
                  Doorstep Pickup
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-emerald-400 transition-colors">
                  Society Scrap Drives
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-emerald-400 transition-colors">
                  Corporate E-Waste Tie-up
                </Link>
              </li>
              <li>
                <Link to="/learning" className="hover:text-emerald-400 transition-colors">
                  Learning Centre
                </Link>
              </li>
              <li>
                <Link to="/donate" className="hover:text-emerald-400 transition-colors">
                  Donate for Trees 🌱
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Operational Cities & Contact */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-200 mb-4">
              Locations
            </h4>
            <div className="space-y-2 text-xs sm:text-sm text-slate-400 mb-5">
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Delhi NCR (Noida, Gzb, Ggn)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Bengaluru (All Zones)</span>
              </div>
            </div>

            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
              Support
            </h4>
            <div className="space-y-1.5 text-xs text-slate-400">
              <p className="flex items-center gap-1.5">
                <PhoneIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>+91 98765 43210</span>
              </p>
              <p className="flex items-center gap-1.5">
                <EnvelopeIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>help@scrapsaathi.in</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ScrapSaathi Technologies. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-slate-400 transition-colors">About</Link>
            <Link to="/contact" className="hover:text-slate-400 transition-colors">Contact</Link>
            <Link to="/privacy-policy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
