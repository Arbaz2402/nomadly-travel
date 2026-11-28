import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AdminAnalyticsCharts = ({ monthlyTrends = [], expenseDistribution = [], pieColors = [] }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 glass-panel rounded-3xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight font-display">
              Monthly Journey Activity
            </h3>
            <p className="text-xs text-slate-400">New journeys created over the last 6 months</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrends}>
              <defs>
                <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff5a36" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ff5a36" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0d1322', borderColor: '#223053', borderRadius: '12px' }}
                itemStyle={{ color: '#ff5a36' }}
              />
              <Area type="monotone" dataKey="trips" stroke="#ff5a36" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTrips)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="lg:col-span-4 glass-panel rounded-3xl p-6 border border-white/10 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight font-display mb-1">
            Expense Categories
          </h3>
          <p className="text-xs text-slate-400 mb-4">Distribution across tracked trip expenses</p>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseDistribution}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={4}
              >
                {expenseDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#0d1322', borderColor: '#223053', borderRadius: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px]">
          {expenseDistribution.map((c, i) => (
            <div key={c._id} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pieColors[i % pieColors.length] }}></span>
              <span className="capitalize text-slate-300 font-medium">{c._id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
