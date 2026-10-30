import React, { useState } from 'react';
import { Train, Clock, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatCurrency, formatDuration } from '../../utils/formatters';

export const TrainCard = ({ train, onBook }) => {
  const [selectedClassCode, setSelectedClassCode] = useState(
    train.classes && train.classes.length > 0 ? train.classes[0].classCode : '3A'
  );

  const currentClass = train.classes?.find((c) => c.classCode === selectedClassCode) || train.classes?.[0];

  return (
    <div className="glass-card rounded-2xl p-5 hover:border-coral-500/40 transition-all">
      {/* Train Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ink-900 border border-white/10 flex items-center justify-center">
            <Train className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-coral-500/10 text-coral-400 border border-coral-500/20 text-xs font-bold font-mono">
                #{train.trainNumber}
              </span>
              <h3 className="font-bold text-white text-base tracking-tight font-display">{train.trainName}</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Runs on: {train.daysRunning?.join(', ') || 'All Days'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Punctuality</span>
            <span className="font-bold text-teal-400">{train.punctualityScore || 95}% On-Time</span>
          </div>
        </div>
      </div>

      {/* Schedule Row */}
      <div className="grid grid-cols-12 items-center gap-2 my-4">
        <div className="col-span-4 text-left">
          <p className="text-xl font-extrabold text-white font-display">{train.departureTime}</p>
          <p className="text-xs font-bold text-coral-400 uppercase tracking-wider">{train.originStationCode}</p>
          <p className="text-xs text-slate-400 truncate">{train.originStationName}</p>
        </div>

        <div className="col-span-4 text-center px-2">
          <span className="text-[11px] font-medium text-slate-400 block mb-1 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(train.durationMinutes)}
          </span>
          <div className="relative flex items-center justify-center">
            <div className="w-full h-[2px] bg-ink-700"></div>
            <div className="absolute w-2 h-2 rounded-full bg-teal-400"></div>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1 block">
            {train.stops?.length || 4} Intermediate Halts
          </span>
        </div>

        <div className="col-span-4 text-right">
          <p className="text-xl font-extrabold text-white font-display">{train.arrivalTime}</p>
          <p className="text-xs font-bold text-teal-400 uppercase tracking-wider">{train.destinationStationCode}</p>
          <p className="text-xs text-slate-400 truncate">{train.destinationStationName}</p>
        </div>
      </div>

      {/* Available Classes Selection */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
          Select Travel Class & Availability
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {train.classes?.map((cls) => {
            const isSelected = cls.classCode === selectedClassCode;
            return (
              <button
                key={cls.classCode}
                type="button"
                onClick={() => setSelectedClassCode(cls.classCode)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-ink-900 border-coral-500 shadow-glow'
                    : 'bg-ink-900/50 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-xs">{cls.classCode}</span>
                  <span className="text-[10px] font-bold text-teal-400 px-1.5 py-0.5 rounded bg-teal-500/10">
                    {cls.statusText || 'AVL'}
                  </span>
                </div>
                <p className="text-sm font-extrabold text-coral-400">{formatCurrency(cls.fare)}</p>
                <p className="text-[10px] text-slate-400 truncate">{cls.className}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* CTA Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Selected Fare</span>
          <span className="text-xl font-extrabold text-white tracking-tight font-display">
            {formatCurrency(currentClass?.fare)}
          </span>
          <span className="text-[10px] text-slate-400 ml-1">({currentClass?.className})</span>
        </div>

        <button
          onClick={() => onBook && onBook(train, currentClass)}
          className="px-5 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs tracking-wide shadow-glow transition-all flex items-center gap-1.5"
        >
          <span>Book Berth</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
