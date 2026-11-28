import React from 'react';
import { Link } from 'react-router-dom';
import {
  Map,
  Split,
  FileText,
  Coins,
  Luggage,
  Calendar,
  ArrowRight,
  Sparkles,
  Users,
  ShieldCheck
} from 'lucide-react';
import { UnifiedSearchHero } from '../../components/search/UnifiedSearchHero';

const CORE_FEATURES = [
  {
    title: 'Collaborative Journey Workspace',
    description:
      'Build day-by-day itineraries, view interactive trip maps, invite travel companions with editor/viewer roles, and track live activity logs.',
    icon: Map,
    color: 'text-coral-400',
    bg: 'bg-coral-500/10 border-coral-500/20',
    link: '/journeys',
    cta: 'Open My Journeys',
  },
  {
    title: 'Group Expense Splitting',
    description:
      'Split bills equally, by exact amounts, percentages, or shares. Exclude anyone from an expense, record settlements, and minimize group debt.',
    icon: Split,
    color: 'text-teal-400',
    bg: 'bg-teal-500/10 border-teal-500/20',
    link: '/journeys',
    cta: 'Manage Group Splits',
  },
  {
    title: 'Private Travel Documents Locker',
    description:
      'Store passports, boarding passes, and PDFs arranged by traveler. Preview images and PDFs inline with zoom & 90° rotation before downloading.',
    icon: FileText,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    link: '/journeys',
    cta: 'Access Documents',
  },
  {
    title: 'Real-Time Intraday FX & Cash Planner',
    description:
      'Live market currency rates synced with intraday feeds, interactive 1D/5D/1M/1Y trend charts, and a physical pocket money estimator.',
    icon: Coins,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    link: '/currency-converter',
    cta: 'Open Currency Converter',
  },
  {
    title: 'Packing Checklists',
    description:
      'Use tailored templates for Beach, Mountains, City, or Trekking—or create your own custom checklists and categories saved automatically.',
    icon: Luggage,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    link: '/packing-checklist',
    cta: 'Open Packing Checklist',
  },
  {
    title: 'Custom Itinerary Planner',
    description:
      'Generate structured multi-day travel plans tailored to your destination, dates, and travel style, then save directly to your Journeys.',
    icon: Calendar,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    link: '/ai-planner',
    cta: 'Launch Trip Planner',
  },
];

export const HomePage = () => {
  return (
    <div className="min-h-screen">
      <UnifiedSearchHero />

      {/* Core Platform Capabilities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-coral-400" />
            Built for Every Trip
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Everything You Need for Group &amp; Solo Travel
          </h2>
          <p className="text-sm text-slate-400">
            Plan itineraries, manage shared budgets, track exchange rates, and keep every travel document within reach.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CORE_FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Link
                key={idx}
                to={feat.link}
                className="group glass-panel p-6 rounded-3xl border border-white/10 hover:border-white/25 transition-all flex flex-col justify-between space-y-5 hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${feat.bg}`}>
                    <Icon className={`w-6 h-6 ${feat.color}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-display group-hover:text-coral-400 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-2">
                      {feat.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-coral-400 pt-2 border-t border-white/5">
                  <span>{feat.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
              <Users className="w-4 h-4" /> Built for Group Trips
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
              Ready to organize your next journey?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Create a shared trip workspace, invite friends by email, upload passports & tickets, and settle expenses without spreadsheets.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/journeys/new"
              className="px-6 py-3 rounded-2xl bg-coral-500 hover:bg-coral-600 text-white text-xs sm:text-sm font-bold shadow-glow transition-all"
            >
              Create New Journey
            </Link>
            <Link
              to="/ai-planner"
              className="px-6 py-3 rounded-2xl bg-ink-900 hover:bg-ink-800 border border-white/10 text-slate-200 text-xs sm:text-sm font-semibold transition-all"
            >
              Launch Trip Planner
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
