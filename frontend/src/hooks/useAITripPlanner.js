import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiClient } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuthStore } from '../store/authStore';

export const useAITripPlanner = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, openAuthModal } = useAuthStore();

  const [destination, setDestination] = useState('Goa');
  const [days, setDays] = useState(3);
  const [travelersCount, setTravelersCount] = useState(2);
  const [budgetStyle, setBudgetStyle] = useState('moderate');
  const [selectedInterests, setSelectedInterests] = useState(['sightseeing', 'culture', 'food']);
  const [customPrompt, setCustomPrompt] = useState('');

  const [generating, setGenerating] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const toggleInterest = (id) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!destination.trim()) {
      showToast('Please enter a destination', 'error');
      return;
    }

    try {
      setGenerating(true);
      const res = await ApiClient.generateAIItinerary({
        destination: destination.trim(),
        days: Number(days),
        travelersCount: Number(travelersCount),
        budgetStyle,
        interests: selectedInterests,
        customPrompt: customPrompt.trim(),
      });

      if (res.success && res.data) {
        setItinerary(res.data);
        setActiveDayIndex(0);
        showToast('Itinerary synthesized successfully!', 'success');
      }
    } catch (err) {
      console.warn('AI Itinerary error:', err.message);
      showToast(err.message || 'Failed to generate itinerary. Please try again.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportToJourney = async () => {
    if (!user) {
      showToast('Please sign in to save this itinerary to your personal journeys workspace.', 'info');
      if (openAuthModal) openAuthModal('signin');
      return;
    }

    if (!itinerary) return;

    try {
      setExporting(true);
      const res = await ApiClient.exportAIItineraryToJourney({
        title: itinerary.title || `Trip to ${itinerary.destination}`,
        destination: itinerary.destination,
        days: itinerary.days,
        travelersCount: itinerary.travelersCount,
        estimatedTotalBudget: itinerary.estimatedTotalBudget,
      });

      if (res.success && res.data?.tripId) {
        showToast('Itinerary saved to My Journeys!', 'success');
        navigate(`/journeys/${res.data.tripId}`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to export to journey', 'error');
    } finally {
      setExporting(false);
    }
  };

  return {
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
  };
};
