import React from 'react';

export const CreateCouponModal = ({
  isOpen,
  couponForm,
  setCouponForm,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/85 backdrop-blur-md overflow-y-auto">
      <form
        onSubmit={onSubmit}
        className="glass-panel max-w-md w-full max-h-[90vh] overflow-y-auto scrollbar-none rounded-3xl p-5 sm:p-6 border border-white/10 space-y-4 my-auto"
      >
        <h3 className="text-base font-bold text-white tracking-tight">Create Promotional Campaign</h3>

        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Coupon Code</label>
          <input
            type="text"
            required
            value={couponForm.code}
            onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
            placeholder="e.g. SUMMER2026"
            className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Campaign Title</label>
          <input
            type="text"
            required
            value={couponForm.title}
            onChange={(e) => setCouponForm({ ...couponForm, title: e.target.value })}
            placeholder="e.g. Summer Vacation Flash Sale"
            className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Discount Type</label>
            <select
              value={couponForm.discountType}
              onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
              className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Discount Value</label>
            <input
              type="number"
              required
              value={couponForm.discountValue}
              onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
              className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-ink-900 text-slate-300 text-xs font-bold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-coral-500 text-white text-xs font-bold"
          >
            Publish Campaign
          </button>
        </div>
      </form>
    </div>
  );
};
