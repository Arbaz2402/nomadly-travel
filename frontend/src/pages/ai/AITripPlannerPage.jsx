import React from 'react';
import { Sparkles, Compass } from 'lucide-react';
import { useAITripPlanner } from '../../hooks/useAITripPlanner';
import { TripPreferencesCard } from '../../components/ai/TripPreferencesCard';
import { GeneratedItineraryView } from '../../components/ai/GeneratedItineraryView';

export const AITripPlannerPage = () => {
  const {
    destination,
    setDestination,
    days,
    setDays,
    travelersCount,
    setTravelersCount,
    budgetStyle,
    setBudgetStyle,
    selectedInterests,
    toggleInterest,
    customPrompt,
    setCustomPrompt,
    generating,
    itinerary,
    exporting,
    activeDayIndex,
    setActiveDayIndex,
    handleGenerate,
    handleExportToJourney,
  } = useAITripPlanner();

  return (
    <div className="min-h-screen pb-20">
      {/* Header Banner */}
      <div className="relative bg-gradient-to-b from-ink-900 to-ink-950 border-b border-white/10 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-coral-500/10 via-amber-500/10 to-teal-500/10 border border-coral-500/30 text-coral-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-coral-400" />
            AI Trip Planner
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            Plan Your Journey in Seconds
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Choose your destination and travel style to generate a day-by-day itinerary with verified stops, timings, and map routes.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Generator Preferences Form */}
          <div className="lg:col-span-5 space-y-6">
            <TripPreferencesCard
              destination={destination}
              setDestination={setDestination}
              days={days}
              setDays={setDays}
              travelersCount={travelersCount}
              setTravelersCount={setTravelersCount}
              budgetStyle={budgetStyle}
              setBudgetStyle={setBudgetStyle}
              selectedInterests={selectedInterests}
              toggleInterest={toggleInterest}
              customPrompt={customPrompt}
              setCustomPrompt={setCustomPrompt}
              generating={generating}
              onGenerate={handleGenerate}
            />
          </div>

          {/* Right Column: Output Preview */}
          <div className="lg:col-span-7">
            {generating ? (
              <div className="glass-panel rounded-3xl border border-white/10 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-coral-500/10 border border-coral-500/20 text-coral-400 mx-auto flex items-center justify-center animate-pulse">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white font-display">
                  Building Your {destination} Itinerary
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Generating daily schedule, route sequence, and venue recommendations...
                </p>
              </div>
            ) : !itinerary ? (
              <div className="glass-panel rounded-3xl border border-white/10 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-ink-900 border border-white/10 text-slate-400 mx-auto flex items-center justify-center">
                  <Compass className="w-8 h-8 text-teal-400" />
                </div>
                <h3 className="text-lg font-bold text-white font-display">Ready to Build Your Journey</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Pick your destination and preferences on the left, then click Generate to create an instant full-scale itinerary.
                </p>
                <button
                  onClick={() => handleGenerate()}
                  className="px-5 py-2.5 rounded-xl bg-ink-900 hover:bg-ink-850 border border-white/10 text-xs font-bold text-slate-300 transition-colors"
                >
                  Try Sample (Goa in 3 Days)
                </button>
              </div>
            ) : (
              <GeneratedItineraryView
                itinerary={itinerary}
                activeDayIndex={activeDayIndex}
                setActiveDayIndex={setActiveDayIndex}
                exporting={exporting}
                onExportToJourney={handleExportToJourney}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITripPlannerPage;
