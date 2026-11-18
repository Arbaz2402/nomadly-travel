/**
 * Google Maps URL and venue query builder utilities
 * Formats venue titles, constructs clean search queries, and builds multi-stop navigation URLs.
 */

/**
 * Strips common activity prefix actions to extract the genuine venue / landmark name
 */
export const cleanVenueTitle = (rawTitle = '') => {
  if (!rawTitle) return '';
  return String(rawTitle)
    .replace(
      /^(lunch at|dinner at|breakfast at|brunch at|evening snacks at|tea and snacks at|coffee at|visit to|explore|tour of|guided tour of|morning walk at|sunset at|sunrise at|trek to|hike to|stop at|relax at)\s+/i,
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

/**
 * Constructs a chained Google Maps directions link connecting all stops for a specific day
 */
export const getGoogleMapsRouteUrl = (activities = [], destination = '') => {
  if (!activities || activities.length === 0) return null;
  const stops = activities
    .map((a) => buildExactVenueQuery(a.title, a.googleMapsQuery || a.location, destination))
    .filter(Boolean);

  if (stops.length === 0) return null;
  if (stops.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stops[0])}`;
  }
  const path = stops.map((s) => encodeURIComponent(s)).join('/');
  return `https://www.google.com/maps/dir/${path}`;
};

/**
 * Constructs a multi-stop Google Maps directions link covering all unique highlights across the trip
 */
export const getAllTripStopsRouteUrl = (days = [], destination = '') => {
  if (!days || days.length === 0) return null;
  const allStops = [];
  days.forEach((d) => {
    d.activities?.forEach((a) => {
      const query = buildExactVenueQuery(a.title, a.googleMapsQuery || a.location, destination);
      if (query && !allStops.includes(query)) {
        allStops.push(query);
      }
    });
  });
  if (allStops.length === 0) return null;
  if (allStops.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(allStops[0])}`;
  }
  const topStops = allStops.slice(0, 10);
  return `https://www.google.com/maps/dir/${topStops.map((s) => encodeURIComponent(s)).join('/')}`;
};
