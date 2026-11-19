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

  // Default to tomorrow if no valid departure date provided
  if (!dateParam) {
    const tmrw = new Date(Date.now() + 86400000);
    const dd = String(tmrw.getDate()).padStart(2, '0');
    const mm = String(tmrw.getMonth() + 1).padStart(2, '0');
    const yyyy = tmrw.getFullYear();
    dateParam = `${dd}/${mm}/${yyyy}`;
  }

  const originClean = origin.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) || 'BOM';
  const destClean = dest.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) || 'DEL';

  return `https://www.makemytrip.com/flight/search?itinerary=${originClean}-${destClean}-${dateParam}&tripType=O&paxType=A-1_C-0_I-0&intl=false&cabinClass=E`;
};

export const buildHotelPartnerUrl = (hotel = {}) => {
  const query = hotel.hotelName || hotel.name || hotel.title || hotel.location?.city || hotel.city || 'Goa';
  const checkinParam = hotel.checkIn ? `&checkin=${hotel.checkIn}` : '';
  const checkoutParam = hotel.checkOut ? `&checkout=${hotel.checkOut}` : '';
  return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(query)}${checkinParam}${checkoutParam}`;
};

export const buildTrainPartnerUrl = (train = {}) => {
  const fromCode = (train.originStationCode || train.originCity || 'BOM').toUpperCase().replace(/[^A-Z]/g, '');
  const toCode = (train.destinationStationCode || train.destinationCity || 'DEL').toUpperCase().replace(/[^A-Z]/g, '');
  if (train.trainNumber) {
    return `https://www.confirmtkt.com/rbooking-d/trains/from/${fromCode || 'BOM'}/to/${toCode || 'DEL'}`;
  }
  return `https://www.confirmtkt.com/rbooking-d/trains/from/${fromCode || 'BOM'}/to/${toCode || 'DEL'}`;
};

export const buildBusPartnerUrl = (bus = {}) => {
  const from = (bus.originCity || 'Mumbai').toLowerCase().replace(/[^a-z0-9]/g, '-');
  const to = (bus.destinationCity || 'Pune').toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `https://www.redbus.in/bus-tickets/${from}-to-${to}`;
};

export const buildPackagePartnerUrl = (pkg = {}) => {
  const dest = pkg.destination || pkg.destinationCity || pkg.title || 'Goa';
  return `https://www.makemytrip.com/holidays-india/${encodeURIComponent(dest.toLowerCase().replace(/\s+/g, '-'))}-tourism.html`;
};
