import React from 'react';
import { User, Plus, Trash2 } from 'lucide-react';

export const SavedTravelersList = ({
  travelers = [],
  showAddTraveler,
  setShowAddTraveler,
  travelerForm,
  setTravelerForm,
  handleSaveTraveler,
  handleDeleteTraveler,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white tracking-tight">Saved Passengers & Family</h2>
        <button
          onClick={() => setShowAddTraveler(true)}
          className="px-4 py-2 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-glow"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Traveler</span>
        </button>
      </div>

      {/* Modal / Form for adding traveler */}
      {showAddTraveler && (
        <form onSubmit={handleSaveTraveler} className="glass-panel rounded-3xl p-6 border border-coral-500/30 space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight">Add Traveler Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Title</label>
              <select
                value={travelerForm.title}
                onChange={(e) => setTravelerForm({ ...travelerForm, title: e.target.value })}
                className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Mr">Mr</option>
                <option value="Ms">Ms</option>
                <option value="Mrs">Mrs</option>
                <option value="Dr">Dr</option>
              </select>
            </div>
            <div className="sm:col-span-5">
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">First Name</label>
              <input
                type="text"
                value={travelerForm.firstName}
                onChange={(e) => setTravelerForm({ ...travelerForm, firstName: e.target.value })}
                placeholder="First Name"
                className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div className="sm:col-span-5">
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Last Name</label>
              <input
                type="text"
                value={travelerForm.lastName}
                onChange={(e) => setTravelerForm({ ...travelerForm, lastName: e.target.value })}
                placeholder="Last Name"
                className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddTraveler(false)}
              className="px-4 py-2 rounded-xl bg-ink-900 text-slate-300 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-coral-500 text-white text-xs font-bold"
            >
              Save Traveler
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {travelers?.map((saved) => (
          <div
            key={saved._id}
            className="glass-card rounded-2xl p-5 border border-white/10 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-ink-900 border border-white/10 flex items-center justify-center font-bold text-coral-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">
                  {saved.title} {saved.firstName} {saved.lastName}
                </p>
                <p className="text-xs text-slate-400 capitalize">{saved.gender} • {saved.nationality || 'Indian'}</p>
              </div>
            </div>

            <button
              onClick={() => handleDeleteTraveler(saved._id)}
              className="p-2 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
              title="Remove traveler"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
