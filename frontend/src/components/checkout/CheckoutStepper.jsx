import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const CheckoutStepper = ({ currentStep = 2 }) => {
  return (
    <div className="flex items-center justify-center gap-4 mb-10 text-xs font-semibold">
      <span className="text-teal-400 flex items-center gap-1.5">
        <CheckCircle2 className="w-4 h-4" /> 1. Search & Select
      </span>
      <span className="w-8 h-[1px] bg-teal-500/40"></span>
      <span
        className={`flex items-center gap-1.5 font-bold ${
          currentStep === 2 ? 'text-coral-500' : 'text-slate-500'
        }`}
      >
        <span
          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
            currentStep === 2 ? 'bg-coral-500 text-white' : 'bg-ink-800 text-slate-400'
          }`}
        >
          2
        </span>
        2. Review & Traveler Details
      </span>
      <span className="w-8 h-[1px] bg-white/10"></span>
      <span className="text-slate-500 flex items-center gap-1.5">
        <span className="w-4 h-4 rounded-full bg-ink-800 text-slate-400 flex items-center justify-center text-[10px]">
          3
        </span>
        3. Confirmation
      </span>
    </div>
  );
};
