import {
  Plane,
  Building2,
  Train,
  Bus,
  Car,
  Utensils,
  Camera,
  ShoppingBag,
  MapPin,
} from 'lucide-react';

export const CATEGORY_ICONS = {
  flight: Plane,
  hotel: Building2,
  train: Train,
  bus: Bus,
  car_rental: Car,
  restaurant: Utensils,
  sightseeing: Camera,
  activities: Camera,
  shopping: ShoppingBag,
  other: MapPin,
};

/**
 * Strips common activity prefix actions to extract the genuine venue / landmark name
 */
export const cleanVenueTitle = (rawTitle = '') => {
  if (!rawTitle) return '';
  return String(rawTitle)
    .replace(
      /^(authentic\s+[\w-]+\s+(lunch|dinner|breakfast|food)\s+at|authentic\s+(lunch|dinner|breakfast)\s+at|scenic\s+drive\s+to|check-in\s+and\s+[\w\s]+at|guided\s+|leisurely\s+lunch\s+at|leisurely\s+dinner\s+at|lunch\s+at|dinner\s+at|breakfast\s+at|brunch\s+at|evening\s+snacks\s+at|tea\s+and\s+snacks\s+at|coffee\s+at|visit\s+to|explore\s+|tour\s+of|guided\s+tour\s+of|morning\s+walk\s+at|sunset\s+at|sunrise\s+at|trek\s+to|hike\s+to|stop\s+at|relax\s+at)\s+/i,
      ''
    )
    .trim();
};

/**
 * Synthesizes an exact, unambiguous venue location query for Google Maps navigation
 */
export const buildExactVenueQuery = (title = '', location = '', destination = '') => {
  const venue = cleanVenueTitle(title);
  const loc = (location || '').trim();
  const dest = (destination || '').trim();

  const parts = [];

  if (loc && venue && loc.toLowerCase().includes(venue.toLowerCase())) {
    parts.push(loc);
  } else {
    if (venue && (!dest || venue.toLowerCase() !== dest.toLowerCase())) {
      parts.push(venue);
    }
    if (
      loc &&
      (!dest || loc.toLowerCase() !== dest.toLowerCase()) &&
      (!venue || !venue.toLowerCase().includes(loc.toLowerCase()))
    ) {
      parts.push(loc);
    }
  }

  if (dest && !parts.some((p) => p.toLowerCase().includes(dest.toLowerCase()))) {
    parts.push(dest);
  }

  return parts.join(', ') || loc || dest;
};

export const CATEGORY_COLORS = {
  flight: '#38bdf8',
  hotel: '#fb923c',
  train: '#a78bfa',
  bus: '#34d399',
  car_rental: '#f43f5e',
  restaurant: '#facc15',
  sightseeing: '#e879f9',
  activities: '#2dd4bf',
  shopping: '#f472b6',
  other: '#94a3b8',
};

export const CHART_COLORS = [
  '#ff5a36',
  '#14b8a6',
  '#6366f1',
  '#f59e0b',
  '#ec4899',
  '#8b5cf6',
  '#10b981',
];
