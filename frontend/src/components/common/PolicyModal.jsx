import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ShieldCheck,
  FileText,
  Lock,
  Headphones,
  CheckCircle2,
  RotateCcw,
  Plane,
  Building2,
  Train,
  Bus,
  Mail,
  Phone,
  Clock,
  Sparkles,
} from 'lucide-react';

export const PolicyModal = ({ isOpen, onClose, initialTab = 'cancellation' }) => {
  const [activeTab, setActiveTab] = React.useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'cancellation', label: 'Cancellation Rules', icon: RotateCcw },
    { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'security', label: 'Security Standards', icon: Lock },
    { id: 'concierge', label: '24/7 Concierge', icon: Headphones },
  ];

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-ink-950/85 backdrop-blur-md p-4 flex justify-center py-6 sm:py-12 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-ink-900 border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 m-auto max-h-[calc(100vh-3rem)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-coral-500/15 border border-coral-500/30 flex items-center justify-center text-coral-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">NOMADLY Trust & Policy Center</h3>
              <p className="text-xs text-slate-400">Official guidelines, customer protections & platform standards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-white/5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-coral-500 text-white shadow-glow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Panels */}
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          {/* CANCELLATION RULES */}
          {activeTab === 'cancellation' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Plane className="w-4 h-4 text-coral-400" />
                  <h4>Flight Cancellations & Refunds</h4>
                </div>
                <p>
                  Flights cancelled at least 24 hours prior to scheduled departure receive refunds according to individual airline fare class rules. For refundable fares, refund credits are initiated immediately to your original payment method within 3–5 business days.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Building2 className="w-4 h-4 text-teal-400" />
                  <h4>Hotels & Boutique Stays</h4>
                </div>
                <p>
                  Most verified properties offer 100% free cancellation up to 48 hours prior to check-in (14:00 local time). Non-refundable promotional bookings are explicitly highlighted with amber badges prior to confirmation.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Train className="w-4 h-4 text-amber-400" />
                  <h4>Indian Railways (IRCTC Slabs)</h4>
                </div>
                <p>
                  Confirmed railway tickets cancelled before chart preparation are refunded per official Indian Railways cancellation tiers (flat fee per passenger for AC1/AC2/AC3/Chair Car). Waitlisted or RAC tickets are automatically refunded if unconfirmed at chart finalization.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Bus className="w-4 h-4 text-rose-400" />
                  <h4>Intercity Luxury Sleeper Coaches</h4>
                </div>
                <p>
                  Cancellations initiated more than 12 hours before origin departure receive a 90% fare refund. Cancellations between 4 and 12 hours receive a 50% refund.
                </p>
              </div>
            </div>
          )}

          {/* PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <h4 className="text-white font-bold text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  Data Minimization & Traveler Privacy
                </h4>
                <p>
                  NOMADLY only collects passenger details (full name, government identity references, contact email, and phone number) required to complete airline ticket issuance, hotel registration, and railway manifest submission.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <h4 className="text-white font-bold text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  Zero Third-Party Data Monetization
                </h4>
                <p>
                  We strictly never sell, license, or monetize your search behavior, itinerary routes, or passenger profiles to third-party ad brokers or marketing lead aggregators.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <h4 className="text-white font-bold text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  Authentication & Session Security
                </h4>
                <p>
                  All credentials and OAuth accounts are brokered by Google Firebase Cloud Authentication. Plaintext passwords never touch our application databases.
                </p>
              </div>
            </div>
          )}

          {/* TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <h4 className="text-white font-bold text-sm">1. Inventory Holds & Pricing Integrity</h4>
                <p>
                  When you initiate a checkout session, NOMADLY locks inventory seats or rooms for 15 minutes to prevent double-booking. If the payment session expires or is abandoned, holds are released back to live inventory automatically.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <h4 className="text-white font-bold text-sm">2. Government ID Accuracy</h4>
                <p>
                  Travelers are responsible for ensuring that names entered during booking precisely match government-issued photo IDs (Aadhaar, Passport, Voter ID) required at airport security, hotel front desks, and railway check-ins.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <h4 className="text-white font-bold text-sm">3. Multi-Modal Transfer Buffers</h4>
                <p>
                  Our Unified Trip Builder automatically flags transfers with less than 90 minutes connection buffer to minimize missed inter-modal connections between flights, trains, and buses.
                </p>
              </div>
            </div>
          )}

          {/* SECURITY STANDARDS */}
          {activeTab === 'security' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <h4 className="text-white font-bold text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4 text-coral-400" />
                  Bank-Grade 256-Bit SSL/TLS Encryption
                </h4>
                <p>
                  All HTTP transactions across NOMADLY are protected with TLS 1.3 encryption, ensuring strict data confidentiality across public Wi-Fi networks and mobile carriers.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <h4 className="text-white font-bold text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  PCI-DSS Level 1 Compliant Architecture
                </h4>
                <p>
                  Payment transactions utilize tokenized authorization envelopes. Credit and debit card numbers are never stored on NOMADLY application servers.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <h4 className="text-white font-bold text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  Cloud Database Isolation
                </h4>
                <p>
                  Customer records and trip workspaces are protected by multi-tenant role authorization middleware ensuring only verified trip owners and invited collaborators can view or modify records.
                </p>
              </div>
            </div>
          )}

          {/* 24/7 CONCIERGE SUPPORT */}
          {activeTab === 'concierge' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-coral-500/15 via-teal-500/10 to-ink-950 border border-coral-500/30 space-y-3">
                <h4 className="text-white font-bold text-sm flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-coral-400" />
                  Dedicated 24/7 Traveler Assistance
                </h4>
                <p>
                  Whether dealing with flight schedule changes, train platform queries, or emergency hotel modifications, our dedicated traveler concierge team is available around the clock.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <Mail className="w-3.5 h-3.5 text-teal-400" />
                    <span>Traveler Support Desk</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">support@nomadly.travel</p>
                  <p className="text-[10px] text-teal-400 font-semibold">Average reply: &lt; 15 mins</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <Phone className="w-3.5 h-3.5 text-coral-400" />
                    <span>Emergency Booking Hotline</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">+91 1800-666-2359 (Toll-Free)</p>
                  <p className="text-[10px] text-coral-400 font-semibold">24/7 Priority Queue</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-ink-950 border border-white/5 flex items-center gap-3">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <p className="text-[11px] text-slate-400">
                  For active bookings with departure within 24 hours, mention your <strong>Booking Reference / PNR</strong> for immediate priority dispatch.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-coral-500 to-rose-600 hover:from-coral-600 text-white font-bold text-xs shadow-glow transition-all"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
