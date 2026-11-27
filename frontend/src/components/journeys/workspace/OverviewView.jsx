import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  MapPin,
  Clock,
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  AlertTriangle,
  CheckCircle2,
  Check,
  ShieldAlert,
  Phone,
  Plus,
  Trash2,
  Printer,
  Sparkles,
  FileCheck,
  Luggage,
  Calendar
} from 'lucide-react';
import { ApiClient } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { TripReportModal } from '../modals/TripReportModal';

const getWeatherIcon = (iconName) => {
  switch (iconName) {
    case 'sun':
      return <Sun className="w-5 h-5 text-amber-400" />;
    case 'rain':
      return <CloudRain className="w-5 h-5 text-sky-400" />;
    case 'snow':
      return <CloudSnow className="w-5 h-5 text-cyan-300" />;
    case 'storm':
      return <CloudLightning className="w-5 h-5 text-purple-400" />;
    case 'cloud':
      return <Cloud className="w-5 h-5 text-slate-400" />;
    default:
      return <CloudSun className="w-5 h-5 text-amber-300" />;
  }
};

export const OverviewView = ({
  trip,
  analytics,
  expenses,
  itinerary = { items: [] },
  settlement = { settlementPlan: [], memberBalances: [] },
  activityLogs = [],
  canEdit = true,
  onSwitchTab,
  onRefresh,
}) => {
  const { showToast } = useToast();
  const [weather, setWeather] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);

  // Emergency contacts form state
  const [addingContact, setAddingContact] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactCategory, setContactCategory] = useState('hotel');

  useEffect(() => {
    let active = true;
    if (trip?._id) {
      ApiClient.getTripWeather(trip._id)
        .then((res) => {
          if (active && res.success && res.data) {
            setWeather(res.data);
          }
        })
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, [trip?._id, trip?.destination]);

  const budget = trip.budget?.totalBudget || 50000;
  const spent = trip.actualSpend || 0;
  const remaining = Math.max(0, budget - spent);
  const utilization = trip.budgetUtilization || 0;

  // 1. Pre-Trip Readiness Score Calculation
  const hasItinerary = (trip.itemsCount || itinerary?.items?.length || 0) > 0;
  const hasDocs = (trip.documentsCount || 0) > 0;
  const hasBudget = budget > 0;

  const packList = trip.packingList || [];
  const totalPack = packList.reduce((sum, c) => sum + (c.items?.length || 0), 0);
  const packedCount = packList.reduce(
    (sum, c) => sum + (c.items?.filter((i) => i.packed).length || 0),
    0
  );
  const packRatio = totalPack > 0 ? packedCount / totalPack : 0;

  const readinessScore = Math.round(
    (hasItinerary ? 30 : 0) +
      (hasDocs ? 20 : 0) +
      (hasBudget ? 20 : 0) +
      (totalPack > 0 ? packRatio * 30 : 0)
  );

  // 2. Today's Agenda Spotlight (during ongoing journey)
  const isOngoing = trip.dynamicStatus === 'ongoing' || trip.status === 'ongoing';
  const todayStr = new Date().toISOString().split('T')[0];
  const allItems = itinerary?.items || [];
  const todaysItems = allItems.filter((item) => {
    if (!item.date) return false;
    return new Date(item.date).toISOString().split('T')[0] === todayStr;
  });
  const spotlightItems = todaysItems.length > 0 ? todaysItems : allItems.slice(0, 4);

  const handleToggleActivityDone = async (item) => {
    if (!canEdit) return;
    const nextStatus = item.status === 'completed' ? 'planned' : 'completed';
    try {
      const res = await ApiClient.updateItineraryItem(trip._id, item._id, { status: nextStatus });
      if (res.success) {
        showToast(
          nextStatus === 'completed' ? `Marked "${item.title}" as done!` : `Reopened "${item.title}"`,
          'success'
        );
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update activity', 'error');
    }
  };

  // 3. Emergency Contacts Management
  const contacts = trip.emergencyContacts || [];

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) return;
    const nextContacts = [
      ...contacts,
      { name: contactName.trim(), phone: contactPhone.trim(), category: contactCategory },
    ];
    try {
      const res = await ApiClient.updateTrip(trip._id, { emergencyContacts: nextContacts });
      if (res.success) {
        showToast('Emergency contact saved!', 'success');
        setContactName('');
        setContactPhone('');
        setAddingContact(false);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Failed to save contact', 'error');
    }
  };

  const handleDeleteContact = async (idx) => {
    const nextContacts = [...contacts];
    nextContacts.splice(idx, 1);
    try {
      const res = await ApiClient.updateTrip(trip._id, { emergencyContacts: nextContacts });
      if (res.success) {
        showToast('Contact removed', 'info');
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Failed to remove contact', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Strip: Export Printable Trip Report */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-ink-900/60 p-4 rounded-2xl border border-white/5">
        <div className="text-xs text-slate-300">
          <span className="font-bold text-white">Journey Command Center</span> — Live weather, pre-trip readiness, SOS contacts & printable trip report.
        </div>
        <button
          onClick={() => setReportOpen(true)}
          className="px-4 py-2 rounded-xl bg-ink-950 hover:bg-ink-800 border border-white/10 text-white text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
        >
          <Printer className="w-3.5 h-3.5 text-coral-400" />
          Export Trip Report / PDF
        </button>
      </div>

      {/* Today's Agenda Spotlight (Shown prominently when Journey is Ongoing / Live) */}
      {isOngoing && spotlightItems.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.04] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-base font-bold text-white font-display">
                {todaysItems.length > 0 ? "Today's Agenda Spotlight" : 'Active Journey Next Activities'}
              </h3>
            </div>
            <button
              onClick={() => onSwitchTab('itinerary')}
              className="text-xs text-emerald-400 hover:underline font-semibold flex items-center gap-1"
            >
              Full Itinerary <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {spotlightItems.map((item) => {
              const isDone = item.status === 'completed';
              return (
                <div
                  key={item._id}
                  onClick={() => handleToggleActivityDone(item)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    canEdit ? 'cursor-pointer' : ''
                  } ${
                    isDone
                      ? 'bg-emerald-500/10 border-emerald-500/30 opacity-75'
                      : 'bg-ink-950/90 border-white/10 hover:border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition-all ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-600 bg-transparent text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div className="truncate">
                      <p className={`text-xs font-bold truncate ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                        {item.title}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {formatDate(item.date)} {item.startTime ? `• ${item.startTime}` : ''}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isDone ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {isDone ? 'Done' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Live 7-Day Weather & Rain Alerts */}
      {weather && weather.forecast?.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                Live 7-Day Weather — {weather.location}
              </h3>
              <p className="text-[11px] text-slate-400">{weather.provider}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {weather.rainAlert && (
                <span className="px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-bold flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5" /> Rain Expected — Pack Umbrella!
                </span>
              )}
              {weather.coldAlert && (
                <span className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5">
                  <CloudSnow className="w-3.5 h-3.5" /> Chilly Nights — Pack Layers!
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {weather.forecast.slice(0, 7).map((day, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-ink-950/90 border border-white/5 text-center space-y-1.5"
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                </span>
                <div className="flex justify-center py-1">{getWeatherIcon(day.icon)}</div>
                <div className="text-xs font-mono font-bold text-white">
                  {day.tempMax}° <span className="text-slate-500 font-normal">/ {day.tempMin}°</span>
                </div>
                <span className="text-[10px] text-sky-400 block">
                  💧 {day.rainChance}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Readiness, Budget & Routes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pre-Trip Readiness Score */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-coral-400" />
                  Pre-Trip Readiness Score
                </h3>
                <p className="text-xs text-slate-400">
                  Track itinerary, packing, documents, and budget before departure.
                </p>
              </div>
              <span
                className={`text-lg font-black font-mono px-3 py-1 rounded-xl border ${
                  readinessScore >= 80
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-coral-500/15 text-coral-400 border-coral-500/30'
                }`}
              >
                {readinessScore}% Ready
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-ink-950 overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-coral-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${readinessScore}%` }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <button
                onClick={() => onSwitchTab('itinerary')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  hasItinerary
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-ink-950 border-white/10 text-slate-300 hover:border-coral-500/40'
                }`}
              >
                <Calendar className="w-4 h-4 mb-1" />
                <span className="text-xs font-bold block">Itinerary</span>
                <span className="text-[10px] opacity-80">
                  {hasItinerary ? `${trip.itemsCount || itinerary?.items?.length} planned` : 'Add activities'}
                </span>
              </button>

              <button
                onClick={() => onSwitchTab('packing')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  totalPack > 0 && packedCount === totalPack
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-ink-950 border-white/10 text-slate-300 hover:border-coral-500/40'
                }`}
              >
                <Luggage className="w-4 h-4 mb-1" />
                <span className="text-xs font-bold block">Packing</span>
                <span className="text-[10px] opacity-80">
                  {totalPack > 0 ? `${packedCount}/${totalPack} packed` : 'Create list'}
                </span>
              </button>

              <button
                onClick={() => onSwitchTab('documents')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  hasDocs
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-ink-950 border-white/10 text-slate-300 hover:border-coral-500/40'
                }`}
              >
                <FileCheck className="w-4 h-4 mb-1" />
                <span className="text-xs font-bold block">Documents</span>
                <span className="text-[10px] opacity-80">
                  {hasDocs ? `${trip.documentsCount} uploaded` : 'Upload IDs'}
                </span>
              </button>

              <button
                onClick={() => onSwitchTab('expenses')}
                className="p-3 rounded-2xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-300 text-left transition-all"
              >
                <CheckCircle2 className="w-4 h-4 mb-1" />
                <span className="text-xs font-bold block">Budget</span>
                <span className="text-[10px] opacity-80">{formatCurrency(budget, trip.currency)} set</span>
              </button>
            </div>
          </div>

          {/* Budget Progress Card */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-display">Budget Telemetry</h3>
              <button
                onClick={() => onSwitchTab('expenses')}
                className="text-xs text-coral-400 hover:underline font-semibold flex items-center gap-1"
              >
                View Full Tracker <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3.5 rounded-2xl bg-ink-950 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Budget</span>
                <span className="text-base sm:text-lg font-black font-mono text-white mt-0.5 block">
                  {formatCurrency(budget, trip.currency)}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-ink-950 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Spent</span>
                <span className="text-base sm:text-lg font-black font-mono text-teal-400 mt-0.5 block">
                  {formatCurrency(spent, trip.currency)}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-ink-950 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Remaining</span>
                <span className="text-base sm:text-lg font-black font-mono text-coral-400 mt-0.5 block">
                  {formatCurrency(remaining, trip.currency)}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-slate-400 font-semibold">
                <span>Utilization ({utilization}%)</span>
                <span>
                  {spent > budget ? 'Budget exceeded!' : `${Math.round(100 - utilization)}% available`}
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-ink-950 overflow-hidden border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    utilization > 100
                      ? 'bg-rose-500'
                      : utilization > 80
                      ? 'bg-amber-500'
                      : 'bg-gradient-to-r from-teal-400 to-coral-500'
                  }`}
                  style={{ width: `${Math.min(100, utilization)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Route Highlights */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
            <h3 className="text-base font-bold text-white font-display">Destinations & Route</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3.5 py-1.5 rounded-xl bg-coral-500/10 border border-coral-500/30 text-coral-400 font-bold text-xs flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Primary: {trip.destination}
              </span>
              {trip.additionalDestinations?.map((dest, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-xs font-semibold"
                >
                  {dest}
                </span>
              ))}
            </div>
            {trip.description && (
              <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-white/5">
                {trip.description}
              </p>
            )}
          </div>
        </div>

        {/* Right Col: Emergency SOS Card & Activity Log Stream */}
        <div className="space-y-6">
          {/* Emergency Contacts & SOS Card */}
          <div className="glass-panel p-6 rounded-3xl border border-rose-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
                <ShieldAlert className="w-4 h-4" />
                Emergency & SOS Contacts
              </div>
              {canEdit && (
                <button
                  onClick={() => setAddingContact((v) => !v)}
                  className="text-xs text-coral-400 hover:text-coral-300 font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              )}
            </div>

            {/* Built-in SOS numbers */}
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <a
                href="tel:112"
                className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
              >
                <span className="text-slate-400 block text-[9px] uppercase font-bold">SOS / Intl</span>
                <span className="font-mono font-black text-rose-300 text-sm">112</span>
              </a>
              <a
                href="tel:100"
                className="p-2.5 rounded-xl bg-ink-950 border border-white/10 hover:border-white/25 transition-colors"
              >
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Police</span>
                <span className="font-mono font-black text-white text-sm">100</span>
              </a>
              <a
                href="tel:108"
                className="p-2.5 rounded-xl bg-ink-950 border border-white/10 hover:border-white/25 transition-colors"
              >
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Medical</span>
                <span className="font-mono font-black text-white text-sm">108</span>
              </a>
            </div>

            {addingContact && (
              <form onSubmit={handleAddContact} className="p-3 rounded-2xl bg-ink-950 border border-white/10 space-y-2.5">
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Name (e.g. Hotel Desk, Driver Raju)"
                  className="w-full px-3 py-2 rounded-xl bg-ink-900 border border-white/10 text-xs text-white"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98765..."
                    className="w-full px-3 py-2 rounded-xl bg-ink-900 border border-white/10 text-xs text-white font-mono"
                  />
                  <select
                    value={contactCategory}
                    onChange={(e) => setContactCategory(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-ink-900 border border-white/10 text-xs text-white"
                  >
                    <option value="hotel">Hotel</option>
                    <option value="local">Driver / Local</option>
                    <option value="embassy">Embassy</option>
                    <option value="medical">Medical</option>
                    <option value="police">Police</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAddingContact(false)}
                    className="px-3 py-1 rounded-lg text-xs text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1 rounded-lg bg-rose-500 text-white text-xs font-bold"
                  >
                    Save Contact
                  </button>
                </div>
              </form>
            )}

            {contacts.length > 0 && (
              <div className="space-y-2">
                {contacts.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 px-3 rounded-xl bg-ink-950 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="truncate">
                      <span className="font-bold text-white block truncate">{c.name}</span>
                      <a href={`tel:${c.phone}`} className="text-[11px] font-mono text-teal-400 hover:underline flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {c.phone}
                      </a>
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => handleDeleteContact(idx)}
                        className="text-slate-600 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Log Stream */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
              <Clock className="w-4 h-4" />
              Recent Activity & Collaboration
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {activityLogs.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No activity logged yet.</p>
              ) : (
                activityLogs.map((log) => (
                  <div key={log._id} className="text-xs pb-3 border-b border-white/5 space-y-0.5">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span className="font-bold text-slate-200">{log.userName}</span>
                      <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-300">{log.details}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Printable Trip Report Modal */}
      <TripReportModal
        trip={trip}
        itinerary={itinerary}
        expenses={expenses}
        settlement={settlement}
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
      />
    </div>
  );
};
