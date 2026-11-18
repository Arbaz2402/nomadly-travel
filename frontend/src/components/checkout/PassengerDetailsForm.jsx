import React from 'react';
import { User } from 'lucide-react';

export const PassengerDetailsForm = ({
  passengers = [],
  setPassengers,
  onAddPassenger,
  contactEmail,
  setContactEmail,
  contactPhone,
  setContactPhone,
}) => {
  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <User className="w-5 h-5 text-coral-500" />
            Traveler Details
          </h2>
          <p className="text-xs text-slate-400">Must match government-issued photo ID</p>
        </div>

        <button
          type="button"
          onClick={onAddPassenger}
          className="text-xs font-bold text-coral-400 hover:text-coral-300 transition-colors"
        >
          + Add Another Passenger
        </button>
      </div>

      {passengers.map((p, idx) => (
        <div key={idx} className="bg-ink-900/50 p-4 rounded-2xl border border-white/5 space-y-3">
          <span className="text-[11px] font-bold text-coral-400 uppercase tracking-wider block">
            Passenger {idx + 1} {idx === 0 && '(Lead Passenger)'}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Title
              </label>
              <select
                value={p.title}
                onChange={(e) => handlePassengerChange(idx, 'title', e.target.value)}
                className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Mr">Mr</option>
                <option value="Ms">Ms</option>
                <option value="Mrs">Mrs</option>
                <option value="Dr">Dr</option>
              </select>
            </div>

            <div className="sm:col-span-5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                First Name
              </label>
              <input
                type="text"
                value={p.firstName}
                onChange={(e) => handlePassengerChange(idx, 'firstName', e.target.value)}
                placeholder="e.g. Aarav"
                className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-coral-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={p.lastName}
                onChange={(e) => handlePassengerChange(idx, 'lastName', e.target.value)}
                placeholder="e.g. Sharma"
                className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-coral-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Contact Details */}
      <div className="pt-4 border-t border-white/5 space-y-3">
        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
          Contact & E-Ticket Delivery Information
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="traveler@example.com"
              className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-coral-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-coral-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
