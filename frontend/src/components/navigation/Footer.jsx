import React, { useState } from 'react';
import { Compass, ShieldCheck, CreditCard, Headphones, Sparkles, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PolicyModal } from '../common/PolicyModal';

export const Footer = () => {
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [policyTab, setPolicyTab] = useState('cancellation');

  const openPolicy = (tab) => {
    setPolicyTab(tab);
    setPolicyModalOpen(true);
  };

  return (
    <>
      <footer className="border-t border-white/5 bg-ink-950 text-slate-400 text-xs">
        {/* Interactive Trust Badges */}
        <div className="border-b border-white/5 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            <button
              type="button"
              onClick={() => openPolicy('terms')}
              className="flex items-center gap-3 text-left group transition-transform hover:scale-[1.02]"
            >
              <div className="w-10 h-10 rounded-xl bg-ink-900 border border-white/5 flex items-center justify-center text-coral-500 group-hover:border-coral-500/30 group-hover:bg-coral-500/10 transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-200 text-sm group-hover:text-coral-400 transition-colors">Verified Inventory</p>
                <p className="text-slate-400 text-[11px]">Direct integration & holds</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => openPolicy('security')}
              className="flex items-center gap-3 text-left group transition-transform hover:scale-[1.02]"
            >
              <div className="w-10 h-10 rounded-xl bg-ink-900 border border-white/5 flex items-center justify-center text-teal-400 group-hover:border-teal-500/30 group-hover:bg-teal-500/10 transition-colors">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-200 text-sm group-hover:text-teal-400 transition-colors">Secure Checkout</p>
                <p className="text-slate-400 text-[11px]">PCI-DSS & 256-bit SSL encryption</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => openPolicy('concierge')}
              className="flex items-center gap-3 text-left group transition-transform hover:scale-[1.02]"
            >
              <div className="w-10 h-10 rounded-xl bg-ink-900 border border-white/5 flex items-center justify-center text-blue-400 group-hover:border-blue-500/30 group-hover:bg-blue-500/10 transition-colors">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-200 text-sm group-hover:text-blue-400 transition-colors">24/7 Concierge</p>
                <p className="text-slate-400 text-[11px]">Dedicated traveler care</p>
              </div>
            </button>

            <Link
              to="/journeys"
              className="flex items-center gap-3 text-left group transition-transform hover:scale-[1.02]"
            >
              <div className="w-10 h-10 rounded-xl bg-ink-900 border border-white/5 flex items-center justify-center text-amber-400 group-hover:border-amber-500/30 group-hover:bg-amber-500/10 transition-colors">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-200 text-sm group-hover:text-amber-400 transition-colors">Unified Itinerary</p>
                <p className="text-slate-400 text-[11px]">Multi-modal journey builder</p>
              </div>
            </Link>
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
              Your entire journey, intelligently organized. Search, compare, and book domestic & international flights and verified luxury boutique stays with live real-time rates.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>Production-Grade Architecture</span>
              <span>•</span>
              <span>Live Flights & Stays Platform</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Travel Modes</h4>
            <ul className="space-y-2">
              <li><Link to="/flights" className="hover:text-coral-400 transition-colors">Flights & Airlines</Link></li>
              <li><Link to="/hotels" className="hover:text-coral-400 transition-colors">Hotels & Resorts</Link></li>
              <li><Link to="/hotels?type=resort" className="hover:text-coral-400 transition-colors">Luxury Boutique Stays</Link></li>
              <li><Link to="/hotels" className="hover:text-coral-400 transition-colors">Curated Getaways</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Smart Features</h4>
            <ul className="space-y-2">
              <li><Link to="/journeys" className="hover:text-coral-400 transition-colors">My Journeys Organizer</Link></li>
              <li><Link to="/trip-builder" className="hover:text-coral-400 transition-colors">Unified Trip Builder</Link></li>
              <li><Link to="/wishlist" className="hover:text-coral-400 transition-colors">Fare Price Watchlist</Link></li>
              <li><Link to="/admin" className="hover:text-coral-400 transition-colors">Admin Governance</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Trust & Policies</h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => openPolicy('cancellation')}
                  className="hover:text-coral-400 transition-colors text-left"
                >
                  Cancellation Rules
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openPolicy('privacy')}
                  className="hover:text-coral-400 transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openPolicy('terms')}
                  className="hover:text-coral-400 transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openPolicy('security')}
                  className="hover:text-coral-400 transition-colors text-left"
                >
                  Security Standards
                </button>
              </li>
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

      {/* Trust & Policy Modal */}
      <PolicyModal
        isOpen={policyModalOpen}
        onClose={() => setPolicyModalOpen(false)}
        initialTab={policyTab}
      />
    </>
  );
};
