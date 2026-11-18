import React from 'react';
import { formatDate } from '../../utils/formatters';

export const AdminUsersTable = ({ users = [], onToggleSuspension }) => {
  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">User Governance & Access Control</h2>
          <p className="text-xs text-slate-400">Suspend accounts, view profiles, and verify security roles</p>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-none rounded-2xl border border-white/5">
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead>
            <tr className="border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-ink-950/40">
              <th className="py-3 px-3">User</th>
              <th className="py-3 px-3">Email</th>
              <th className="py-3 px-3">Role</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Joined</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-200">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-white/5 transition-colors">
                <td className="py-3 px-3 font-bold text-white">{u.displayName}</td>
                <td className="py-3 px-3">{u.email}</td>
                <td className="py-3 px-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      u.role === 'admin' ? 'bg-coral-500/10 text-coral-400' : 'bg-ink-800 text-slate-300'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      u.isSuspended ? 'bg-rose-500/10 text-rose-400' : 'bg-teal-500/10 text-teal-400'
                    }`}
                  >
                    {u.isSuspended ? 'Suspended' : 'Active'}
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-400">{formatDate(u.createdAt)}</td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => onToggleSuspension(u._id)}
                    className="px-2.5 py-1 rounded-lg bg-ink-900 border border-white/10 text-[11px] font-bold hover:text-coral-400 transition-colors"
                  >
                    {u.isSuspended ? 'Reactivate' : 'Suspend'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
