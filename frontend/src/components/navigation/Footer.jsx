import React from 'react';
import { Compass, ShieldCheck, CreditCard, Headphones, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-ink-950 text-slate-400 text-xs">
      {/* Trust Badges */}
      <div className="border-b border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ink-900 border border-white/5 flex items-center justify-center text-coral-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-200 text-sm">Verified Inventory</p>
              <p className="text-slate-400 text-[11px]">Direct integration & holds</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ink-900 border border-white/5 flex items-center justify-center text-teal-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-200 text-sm">Secure Checkout</p>
              <p className="text-slate-400 text-[11px]">PCI-DSS & 256-bit SSL encryption</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ink-900 border border-white/5 flex items-center justify-center text-blue-400">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-200 text-sm">24/7 Concierge</p>
              <p className="text-slate-400 text-[11px]">Dedicated traveler care</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ink-900 border border-white/5 flex items-center justify-center text-amber-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-200 text-sm">Unified Itinerary</p>
              <p className="text-slate-400 text-[11px]">Multi-modal journey builder</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-coral-500 flex items-center justify-center text-white">
              <Compass className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight font-display">NOMADLY</span>
          </div>
          <p className="text-slate-400 max-w-sm mb-4 leading-relaxed">
            Your entire journey, intelligently organized. Search, compare, and book domestic & international flights, boutique stays, express trains, and luxury sleeper coaches.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span>Portfolio Project</span>
            <span>•</span>
            <span>Advanced MERN Architecture</span>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Travel Modes</h4>
          <ul className="space-y-2">
            <li><Link to="/flights" className="hover:text-coral-400 transition-colors">Flights & Airlines</Link></li>
            <li><Link to="/hotels" className="hover:text-coral-400 transition-colors">Hotels & Resorts</Link></li>
            <li><Link to="/trains" className="hover:text-coral-400 transition-colors">Vande Bharat & Trains</Link></li>
            <li><Link to="/buses" className="hover:text-coral-400 transition-colors">Intercity Sleeper Buses</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Smart Features</h4>
          <ul className="space-y-2">
            <li><Link to="/trip-builder" className="hover:text-coral-400 transition-colors">Unified Trip Builder</Link></li>
            <li><Link to="/dashboard" className="hover:text-coral-400 transition-colors">Smart Trip Budget</Link></li>
            <li><Link to="/wishlist" className="hover:text-coral-400 transition-colors">Fare Price Watchlist</Link></li>
            <li><Link to="/admin" className="hover:text-coral-400 transition-colors">Admin Governance</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Trust & Policies</h4>
          <ul className="space-y-2">
            <li><a href="#terms" className="hover:text-coral-400 transition-colors">Cancellation Rules</a></li>
            <li><a href="#privacy" className="hover:text-coral-400 transition-colors">Privacy Policy</a></li>
            <li><a href="#terms" className="hover:text-coral-400 transition-colors">Terms of Service</a></li>
            <li><a href="#security" className="hover:text-coral-400 transition-colors">Security Standards</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} NOMADLY Inc. Built with React, Node, Express, MongoDB & Tailwind.</p>
          <p className="flex items-center gap-1">
            Engineered for high-concurrency travel booking demonstration.
          </p>
        </div>
      </div>
    </footer>
  );
};
