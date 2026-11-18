import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const DEFAULT_ADDONS = [
  {
    id: 'insurance',
    name: 'Comprehensive Travel Care & Baggage Protection',
    price: 299,
    desc: 'Coverage up to ₹5,00,000 for emergency medical & delay protection',
  },
  {
    id: 'zero_cancel',
    name: 'Zero Cancellation Guarantee',
    price: 499,
    desc: 'Receive 100% instant refund if you cancel up to 12 hours prior to departure',
  },
];

export const JourneyAddons = ({
  addons = DEFAULT_ADDONS,
  selectedAddOns = [],
  setSelectedAddOns,
}) => {
  const handleToggleAddon = (addon) => {
    const exists = selectedAddOns.some((a) => a.id === addon.id);
    if (exists) {
      setSelectedAddOns(selectedAddOns.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddOns([...selectedAddOns, addon]);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
      <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-teal-400" />
        Recommended Journey Add-ons
      </h3>

      <div className="space-y-3">
        {addons.map((addon) => {
          const isSelected = selectedAddOns.some((a) => a.id === addon.id);
          return (
            <label
              key={addon.id}
              className={`flex items-start justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-ink-900 border-teal-500/50 shadow-glow-teal'
                  : 'bg-ink-900/40 border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleAddon(addon)}
                  className="mt-1 rounded bg-ink-950 border-white/20 text-teal-500 focus:ring-0 w-4 h-4"
                />
                <div>
                  <p className="text-xs font-bold text-white">{addon.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{addon.desc}</p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-teal-400 ml-3">
                +{formatCurrency(addon.price)}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};
