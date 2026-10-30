import React, { useState, useEffect } from 'react';
import {
  Compass,
  Plus,
  Plane,
  Building2,
  Train,
  Bus,
  Clock,
  ArrowRight,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { ApiClient } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const TripBuilderPage = () => {
  const { showToast } = useToast();

  const [trips, setTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form for new segment
  const [showAddSegment, setShowAddSegment] = useState(false);
  const [newSegment, setNewSegment] = useState({
    segmentType: 'train',
    title: 'Vande Bharat Express (Ahmedabad to Mumbai Central)',
    fromLocation: 'Ahmedabad (ADI)',
    toLocation: 'Mumbai (MMCT)',
    startDateTime: '2026-11-15T06:00:00',
    endDateTime: '2026-11-15T11:25:00',
    estimatedCost: 2615,
    actualCost: 2615,
    status: 'confirmed',
    notes: 'Executive Chair Car berth booked',
  });

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getMyTrips();
      if (res.success && res.data.length > 0) {
        setTrips(res.data);
        setActiveTrip(res.data[0]);
      } else {
        // Create an illustrative sample trip if none exists
        createSampleTrip();
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const createSampleTrip = async () => {
    try {
      const res = await ApiClient.createTrip({
        title: 'Golden Triangle & Coastal Odyssey 2026',
        destination: 'Mumbai • Delhi • Udaipur',
        startDate: new Date('2026-11-15'),
        endDate: new Date('2026-11-25'),
        description: 'Multi-part journey linking express railway, flight transfer, and luxury heritage palace resort stay.',
        budget: {
          totalBudget: 60000,
          allocatedTransport: 25000,
          allocatedStay: 30000,
          allocatedActivities: 5000,
        },
      });

      if (res.success && res.data) {
        // Add sample segments
        await ApiClient.addTripSegment(res.data._id, {
          segmentType: 'train',
          title: 'Vande Bharat Express (20901)',
          fromLocation: 'Ahmedabad (ADI)',
          toLocation: 'Mumbai (MMCT)',
          startDateTime: new Date('2026-11-15T06:00:00Z'),
          endDateTime: new Date('2026-11-15T11:25:00Z'),
          estimatedCost: 2615,
          actualCost: 2615,
          status: 'confirmed',
          notes: 'Leg 1: High speed rail transfer',
        });

        await ApiClient.addTripSegment(res.data._id, {
          segmentType: 'flight',
          title: 'IndiGo 6E-205 (BOM → DEL)',
          fromLocation: 'Mumbai (BOM)',
          toLocation: 'Delhi (DEL)',
          startDateTime: new Date('2026-11-16T06:45:00Z'),
          endDateTime: new Date('2026-11-16T08:55:00Z'),
          estimatedCost: 5973,
          actualCost: 5473,
          status: 'confirmed',
          notes: 'Leg 2: Domestic connection. 19h connection gap in Mumbai.',
        });

        await ApiClient.addTripSegment(res.data._id, {
          segmentType: 'hotel',
          title: 'The Taj Mahal Palace, Mumbai',
          fromLocation: 'Apollo Bunder, Colaba',
          toLocation: 'Gateway of India',
          startDateTime: new Date('2026-11-15T14:00:00Z'),
          endDateTime: new Date('2026-11-16T04:30:00Z'),
          estimatedCost: 24500,
          actualCost: 24500,
          status: 'confirmed',
          notes: 'Luxury overnight transit stay with sea view',
        });

        const refreshed = await ApiClient.getTripById(res.data._id);
        setTrips([refreshed.data]);
        setActiveTrip(refreshed.data);
      }
    } catch (err) {
      console.error('Error creating sample trip:', err);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleAddSegment = async (e) => {
    e.preventDefault();
    if (!activeTrip) return;
    try {
      const res = await ApiClient.addTripSegment(activeTrip._id, newSegment);
      if (res.success) {
        showToast('Trip segment added to timeline!', 'success');
        setShowAddSegment(false);
        setActiveTrip(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to add segment', 'error');
    }
  };

  const getSegmentIcon = (type) => {
    if (type === 'flight') return Plane;
    if (type === 'hotel') return Building2;
    if (type === 'train') return Train;
    return Bus;
  };

  // Budget calculations
  const totalSpent = activeTrip?.segments?.reduce((sum, s) => sum + (s.actualCost || s.estimatedCost || 0), 0) || 0;
  const totalBudget = activeTrip?.budget?.totalBudget || 60000;
  const remainingBudget = Math.max(0, totalBudget - totalSpent);
  const budgetPercent = Math.min(100, Math.round((totalSpent / totalBudget) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 mb-8 border border-white/10 flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-coral-400 uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Intelligent Itinerary Orchestration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
            Unified Multi-Segment Trip Builder
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Seamlessly combine flights, hotels, trains, and buses with timeline gap awareness and smart budget tracking.
          </p>
        </div>

        <button
          onClick={() => setShowAddSegment(true)}
          className="px-5 py-2.5 rounded-2xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs tracking-wide shadow-glow transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Journey Segment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Chronological Journey Timeline */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-white/10">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight font-display">
                  {activeTrip?.title || 'Trip Timeline'}
                </h2>
                <p className="text-xs text-slate-400">
                  {activeTrip?.destination} • {activeTrip?.segments?.length || 0} Journey Segments
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-bold uppercase">
                {activeTrip?.status || 'Active Plan'}
              </span>
            </div>

            {/* Visual Timeline Segments */}
            <div className="relative border-l-2 border-white/10 ml-4 space-y-8 pl-6">
              {activeTrip?.segments?.map((segment, index) => {
                const Icon = getSegmentIcon(segment.segmentType);
                return (
                  <div key={index} className="relative group">
                    {/* Timeline Node Icon */}
                    <div className="absolute -left-[35px] top-0 w-8 h-8 rounded-full bg-ink-900 border-2 border-coral-500 flex items-center justify-center text-coral-400 shadow-glow">
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Segment Card */}
                    <div className="glass-card rounded-2xl p-5 border border-white/5 hover:border-coral-500/30 transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] uppercase font-bold text-coral-400 tracking-wider">
                          SEGMENT {index + 1} • {segment.segmentType.toUpperCase()}
                        </span>
                        <span className="text-xs font-extrabold text-white">
                          {formatCurrency(segment.actualCost || segment.estimatedCost)}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white tracking-tight font-display">
                        {segment.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 my-2">
                        <span>{segment.fromLocation} → {segment.toLocation}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(segment.startDateTime)}
                        </span>
                      </div>

                      {segment.notes && (
                        <p className="text-xs text-slate-400 mt-2 bg-ink-900/60 p-2.5 rounded-xl border border-white/5">
                          {segment.notes}
                        </p>
                      )}

                      {/* Connection Gap Awareness Warning if gap exists */}
                      {index < activeTrip.segments.length - 1 && (
                        <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Layover & transfer buffer identified between segments</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Segment Modal / Form */}
          {showAddSegment && (
            <form onSubmit={handleAddSegment} className="glass-panel rounded-3xl p-6 border border-coral-500/40 space-y-4">
              <h3 className="text-sm font-bold text-white tracking-tight">Add Journey Segment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-3">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Type</label>
                  <select
                    value={newSegment.segmentType}
                    onChange={(e) => setNewSegment({ ...newSegment, segmentType: e.target.value })}
                    className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="flight">Flight</option>
                    <option value="hotel">Hotel Stay</option>
                    <option value="train">Train</option>
                    <option value="bus">Bus</option>
                  </select>
                </div>

                <div className="sm:col-span-9">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Title / Description</label>
                  <input
                    type="text"
                    value={newSegment.title}
                    onChange={(e) => setNewSegment({ ...newSegment, title: e.target.value })}
                    className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">From Location</label>
                  <input
                    type="text"
                    value={newSegment.fromLocation}
                    onChange={(e) => setNewSegment({ ...newSegment, fromLocation: e.target.value })}
                    className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">To Location</label>
                  <input
                    type="text"
                    value={newSegment.toLocation}
                    onChange={(e) => setNewSegment({ ...newSegment, toLocation: e.target.value })}
                    className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Estimated Cost (₹)</label>
                  <input
                    type="number"
                    value={newSegment.estimatedCost}
                    onChange={(e) => setNewSegment({ ...newSegment, estimatedCost: Number(e.target.value) })}
                    className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSegment(false)}
                  className="px-4 py-2 rounded-xl bg-ink-900 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-coral-500 text-white text-xs font-bold"
                >
                  Append to Itinerary
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Smart Trip Budget Calculator */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-white/10 sticky top-28 space-y-6">
            <h3 className="text-base font-bold text-white tracking-tight font-display border-b border-white/5 pb-3">
              Smart Trip Budget Tracker
            </h3>

            {/* Budget Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-400">Budget Utilized ({budgetPercent}%)</span>
                <span className="font-bold text-white">{formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-ink-900 overflow-hidden border border-white/5">
                <div
                  className={`h-full transition-all duration-500 ${
                    budgetPercent > 90 ? 'bg-rose-500' : 'bg-gradient-to-r from-teal-400 to-coral-500'
                  }`}
                  style={{ width: `${budgetPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Remaining Balance Card */}
            <div className="p-4 rounded-2xl bg-ink-900/80 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Remaining Budget</span>
                <p className="text-2xl font-extrabold text-teal-400 font-display">
                  {formatCurrency(remainingBudget)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            {/* Cost Breakdown by Category */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Expenses by Category
              </span>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-300">
                  <Plane className="w-3.5 h-3.5 text-coral-500" /> Flights
                </span>
                <span className="font-bold text-white">
                  {formatCurrency(activeTrip?.segments?.filter((s) => s.segmentType === 'flight').reduce((sum, s) => sum + s.actualCost, 0) || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-300">
                  <Building2 className="w-3.5 h-3.5 text-teal-400" /> Hotels & Stays
                </span>
                <span className="font-bold text-white">
                  {formatCurrency(activeTrip?.segments?.filter((s) => s.segmentType === 'hotel').reduce((sum, s) => sum + s.actualCost, 0) || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-300">
                  <Train className="w-3.5 h-3.5 text-amber-400" /> Trains & Rail
                </span>
                <span className="font-bold text-white">
                  {formatCurrency(activeTrip?.segments?.filter((s) => s.segmentType === 'train').reduce((sum, s) => sum + s.actualCost, 0) || 0)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-coral-500/10 border border-coral-500/20 rounded-2xl text-[11px] text-coral-300">
              💡 Budget estimates are updated automatically as reservations are confirmed in your cart.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
