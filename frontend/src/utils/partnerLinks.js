/**
 * Generates verified partner booking URLs for external reservations
 * Supports MakeMyTrip (Flights/Packages), Booking.com (Hotels), IRCTC/ConfirmTkt (Trains), and redBus (Buses)
 */

export const getPartnerInfo = (category = 'flight', item = {}) => {
  switch (category) {
    case 'flight':
      return {
        name: 'MakeMyTrip Flights',
        badge: 'Official Airline Partner',
        url: buildFlightPartnerUrl(item),
      };
    case 'hotel':
      return {
        name: 'Booking.com',
        badge: 'Verified Stay Partner',
        url: buildHotelPartnerUrl(item),
      };
    case 'train':
      return {
        name: 'IRCTC / ConfirmTkt',
        badge: 'Authorized Rail Partner',
        url: buildTrainPartnerUrl(item),
      };
    case 'bus':
      return {
        name: 'redBus',
        badge: 'Certified Intercity Partner',
        url: buildBusPartnerUrl(item),
      };
    case 'package':
    case 'experience':
    default:
      return {
        name: 'MakeMyTrip Holidays',
        badge: 'Curated Travel Partner',
        url: buildPackagePartnerUrl(item),
      };
  }
};

export const buildFlightPartnerUrl = (flight = {}) => {
  const origin = flight.originCode || flight.originCity || 'BOM';
  const dest = flight.destinationCode || flight.destinationCity || 'DEL';
  const rawDate = flight.departureDate || '';

  let dateParam = '';
  if (rawDate) {
    try {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        dateParam = `${dd}/${mm}/${yyyy}`;
      }
    } catch {
      dateParam = '';
    }
  }

  if (dateParam) {
    return `https://www.makemytrip.com/flight/search?itinerary=${origin.toUpperCase()}-${dest.toUpperCase()}-${dateParam}&tripType=O&paxType=A-1_C-0_I-0&intl=false&cabinClass=E`;
  }
  return `https://www.google.com/travel/flights?q=Flights%20to%20${encodeURIComponent(dest)}%20from%20${encodeURIComponent(origin)}`;
};

export const buildHotelPartnerUrl = (hotel = {}) => {
  const query = hotel.name || hotel.title || hotel.location?.city || hotel.city || 'Goa';
  return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(query)}`;
};

export const buildTrainPartnerUrl = (train = {}) => {
  const fromCode = (train.originStationCode || train.originCity || 'BOM').toUpperCase();
  const toCode = (train.destinationStationCode || train.destinationCity || 'DEL').toUpperCase();
  return `https://www.confirmtkt.com/rbooking-d/trains/from/${fromCode}/to/${toCode}`;
};

export const buildBusPartnerUrl = (bus = {}) => {
  const from = (bus.originCity || 'Mumbai').toLowerCase().replace(/\s+/g, '-');
  const to = (bus.destinationCity || 'Pune').toLowerCase().replace(/\s+/g, '-');
  return `https://www.redbus.in/bus-tickets/${from}-to-${to}`;
};

export const buildPackagePartnerUrl = (pkg = {}) => {
  const dest = pkg.destination || pkg.destinationCity || pkg.title || 'Goa';
  return `https://www.makemytrip.com/holidays-india/${encodeURIComponent(dest.toLowerCase().replace(/\s+/g, '-'))}-tourism.html`;
};
