import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ShieldCheck,
  FileText,
  Lock,
  Headphones,
  CheckCircle2,
  Compass,
  Users,
  Wallet,
  Mail,
  Phone,
  Clock,
  Sparkles,
} from 'lucide-react';

export const PolicyModal = ({ isOpen, onClose, initialTab = 'guidelines' }) => {
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
    { id: 'guidelines', label: 'Platform Guidelines', icon: Compass },
    { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'security', label: 'Security Standards', icon: Lock },
    { id: 'concierge', label: 'Traveler Support', icon: Headphones },
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
          {/* PLATFORM GUIDELINES */}
          {activeTab === 'guidelines' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Users className="w-4 h-4 text-coral-400" />
                  <h4>Collaborative Trip Workspaces</h4>
                </div>
                <p>
                  Journey owners can invite companions as Editors or Viewers. Only accepted collaborators can participate in shared itinerary planning, packing lists, and group expense splits.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Wallet className="w-4 h-4 text-teal-400" />
                  <h4>Expense Splitting & Travel Tools</h4>
                </div>
                <p>
                  Log trip expenses, split balances transparently across active members, send settlement reminder emails, and organize boarding passes, visas, and IDs inside your private Document Vault.
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
                  NOMADLY only collects account details (display name, email, and trip workspace data) required to power collaborative itinerary planning, group expense splitting, and personal travel document storage.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <h4 className="text-white font-bold text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  Zero Third-Party Data Monetization
                </h4>
                <p>
                  We strictly never sell, license, or monetize your travel itineraries, expense logs, or uploaded documents to third-party ad brokers or marketing lead aggregators.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <h4 className="text-white font-bold text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  Authentication & Session Security
                </h4>
                <p>
                  All credentials and OAuth accounts are brokered by Google Firebase Authentication. Plaintext passwords never touch our application databases.
                </p>
              </div>
            </div>
          )}

          {/* TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <h4 className="text-white font-bold text-sm">1. Workspace Ownership & Collaborator Access</h4>
                <p>
                  Journey owners control member invitations, role assignments (Editor or Viewer), and member removal. Revoking or removing a collaborator immediately restricts their access to the journey workspace.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <h4 className="text-white font-bold text-sm">2. Expense Ledgers & Settlement Reminders</h4>
                <p>
                  Expense splitting and settlement plans are provided as an organizational ledger for group trips. Settlement reminder emails notify companions of recorded balances; NOMADLY does not process direct peer-to-peer funds.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <h4 className="text-white font-bold text-sm">3. Third-Party FX & Weather Feeds</h4>
                <p>
                  Currency exchange rates and destination weather forecasts are fetched from third-party data providers for informational trip planning only and should be verified before transacting or departing.
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
                  256-Bit SSL/TLS Transport Encryption
                </h4>
                <p>
                  All HTTP requests across NOMADLY are protected with TLS encryption, ensuring strict confidentiality for itineraries, expense logs, and uploaded travel documents.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <h4 className="text-white font-bold text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  Firebase Token Verification & Role Enforcement
                </h4>
                <p>
                  Every protected API endpoint verifies Firebase ID tokens server-side and enforces strict trip ownership and collaborator role checks before reading or modifying workspace data.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <h4 className="text-white font-bold text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  Private Document Vault Isolation
                </h4>
                <p>
                  Uploaded boarding passes, visas, and travel IDs are scoped strictly to authorized members of the journey workspace.
                </p>
              </div>
            </div>
          )}

          {/* TRAVELER SUPPORT */}
          {activeTab === 'concierge' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-coral-500/15 via-teal-500/10 to-ink-950 border border-coral-500/30 space-y-3">
                <h4 className="text-white font-bold text-sm flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-coral-400" />
                  Dedicated 24/7 Traveler Assistance
                </h4>
                <p>
                  Whether organizing group itineraries, resolving expense splits, or managing your travel documents, our dedicated traveler support team is available around the clock.
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
                    <span>Priority Journey Support</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">+91 1800-666-2359 (Toll-Free)</p>
                  <p className="text-[10px] text-coral-400 font-semibold">24/7 Assistance Line</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-ink-950 border border-white/5 flex items-center gap-3">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <p className="text-[11px] text-slate-400">
                  For faster help with an active trip, include your <strong>Journey Title</strong> or registered account email when reaching out.
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

