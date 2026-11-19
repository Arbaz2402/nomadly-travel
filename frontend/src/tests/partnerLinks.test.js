import { describe, it, expect } from 'vitest';
import {
  getPartnerInfo,
  buildFlightPartnerUrl,
  buildHotelPartnerUrl,
  buildTrainPartnerUrl,
  buildBusPartnerUrl,
  buildPackagePartnerUrl,
} from '../utils/partnerLinks';

describe('Partner Deep Links & Navigation Suite', () => {
  describe('buildFlightPartnerUrl', () => {
    it('generates authentic MakeMyTrip search URL with route and date', () => {
      const flight = {
        originCode: 'BOM',
        destinationCode: 'DEL',
        departureDate: '2026-12-15',
      };
      const url = buildFlightPartnerUrl(flight);

      expect(url).toContain('makemytrip.com/flight/search');
      expect(url).toContain('BOM-DEL');
      expect(url).toContain('15/12/2026');
      expect(url).toContain('paxType=A-1_C-0_I-0');
    });

    it('falls back to tomorrow date when departureDate is empty or invalid', () => {
      const flight = {
        originCode: 'BLR',
        destinationCode: 'GOI',
      };
      const url = buildFlightPartnerUrl(flight);

      expect(url).toContain('makemytrip.com/flight/search');
      expect(url).toContain('BLR-GOI');
    });
  });

  describe('buildHotelPartnerUrl', () => {
    it('generates Booking.com search URL with hotel query and check-in/out', () => {
      const hotel = {
        name: 'The Oberoi Udaivilas',
        checkIn: '2026-11-20',
        checkOut: '2026-11-24',
      };
      const url = buildHotelPartnerUrl(hotel);

      expect(url).toContain('booking.com/searchresults.html');
      expect(url).toContain('The%20Oberoi%20Udaivilas');
      expect(url).toContain('checkin=2026-11-20');
      expect(url).toContain('checkout=2026-11-24');
    });
  });

  describe('buildTrainPartnerUrl', () => {
    it('generates ConfirmTkt / IRCTC URL with origin and destination station codes', () => {
      const train = {
        originStationCode: 'NDLS',
        destinationStationCode: 'BCT',
        trainNumber: '12952',
      };
      const url = buildTrainPartnerUrl(train);

      expect(url).toContain('confirmtkt.com/rbooking-d/trains/from/NDLS/to/BCT');
    });
  });

  describe('buildBusPartnerUrl', () => {
    it('generates redBus URL with hyphenated city slugs', () => {
      const bus = {
        originCity: 'Mumbai',
        destinationCity: 'Pune',
      };
      const url = buildBusPartnerUrl(bus);

      expect(url).toBe('https://www.redbus.in/bus-tickets/mumbai-to-pune');
    });
  });

  describe('getPartnerInfo', () => {
    it('returns MakeMyTrip Flights branding for flights', () => {
      const info = getPartnerInfo('flight', { originCode: 'BOM', destinationCode: 'DEL' });
      expect(info.name).toBe('MakeMyTrip Flights');
      expect(info.url).toContain('makemytrip.com');
    });

    it('returns Booking.com branding for hotels', () => {
      const info = getPartnerInfo('hotel', { name: 'Alila Diwa' });
      expect(info.name).toBe('Booking.com');
      expect(info.url).toContain('booking.com');
    });

    it('returns IRCTC / ConfirmTkt branding for trains', () => {
      const info = getPartnerInfo('train', { originStationCode: 'BOM', destinationStationCode: 'DEL' });
      expect(info.name).toContain('IRCTC');
      expect(info.url).toContain('confirmtkt.com');
    });

    it('returns redBus branding for buses', () => {
      const info = getPartnerInfo('bus', { originCity: 'Delhi', destinationCity: 'Jaipur' });
      expect(info.name).toBe('redBus');
      expect(info.url).toContain('redbus.in');
    });
  });
});
