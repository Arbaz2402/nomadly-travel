import { Booking } from '../models/Booking.js';
import { PricingService } from '../services/booking/pricingService.js';
import { InventoryHoldService } from '../services/inventory/holdService.js';
import { Bus } from '../models/Bus.js';
import { FlightOffer } from '../models/FlightOffer.js';
import { Hotel } from '../models/Hotel.js';
import { Train } from '../models/Train.js';
import { Experience } from '../models/Experience.js';
import { Refund } from '../models/Refund.js';

export const createBooking = async (req, res) => {
  try {
    const {
      travelCategory,
      inventoryId,
      passengers,
      contactInfo,
      couponCode,
      addOns = [],
      sessionId,
      customSnapshot, // Optional extra metadata
      providerReference,
      providerName: customProviderName,
      isDirectConfirmed = false,
    } = req.body;

    let resolvedPassengers = passengers;
    if ((!resolvedPassengers || !resolvedPassengers.length) && isDirectConfirmed) {
      resolvedPassengers = [
        {
          title: 'Guest',
          firstName: req.user?.displayName?.split(' ')[0] || 'Traveler',
          lastName: req.user?.displayName?.split(' ').slice(1).join(' ') || '',
        },
      ];
    } else if (!resolvedPassengers || !resolvedPassengers.length) {
      return res.status(400).json({ success: false, message: 'At least one traveler is required.' });
    }

    const resolvedContactInfo = contactInfo && contactInfo.email ? contactInfo : {
      email: req.user?.email || 'traveler@nomadly.travel',
      phone: req.user?.phoneNumber || '+91 99999 99999',
    };

    let baseFare = 0;
    let itinerarySnapshot = customSnapshot || {};
    let providerName = 'NOMADLY_DEMO';

    // 1. Revalidate inventory item and retrieve authoritative server base fare
    if (travelCategory === 'flight') {
      const flight = await FlightOffer.findById(inventoryId);
      if (!flight || !flight.isActive) {
        return res.status(404).json({ success: false, message: 'Flight offer is no longer available.' });
      }
      baseFare = flight.pricing?.baseFare || flight.pricing?.totalAmount || 4200;
      providerName = flight.provider;
      itinerarySnapshot = {
        offerReference: flight.offerReference,
        originCity: flight.originCity,
        originCode: flight.originCode,
        destinationCity: flight.destinationCity,
        destinationCode: flight.destinationCode,
        departureDate: flight.departureDate,
        legs: flight.legs,
        cabinClass: flight.cabinClass,
        baggage: flight.baggage,
      };
    } else if (travelCategory === 'hotel') {
      const hotel = await Hotel.findById(inventoryId);
      if (!hotel || !hotel.isActive) {
        return res.status(404).json({ success: false, message: 'Hotel is no longer available.' });
      }
      const room = hotel.rooms[0]; // First room or selected room
      baseFare = room ? room.pricePerNight : 4500;
      providerName = hotel.brand || 'Boutique Collection';
      itinerarySnapshot = {
        hotelId: hotel._id,
        name: hotel.name,
        city: hotel.location.city,
        address: hotel.location.address,
        starRating: hotel.starRating,
        roomName: room?.name || 'Deluxe Room',
        checkInTime: hotel.checkInTime,
        checkOutTime: hotel.checkOutTime,
        policies: hotel.policies,
      };
    } else if (travelCategory === 'train') {
      const train = await Train.findById(inventoryId);
      if (!train || !train.isActive) {
        return res.status(404).json({ success: false, message: 'Train schedule not found.' });
      }
      const selectedClass = train.classes[0];
      baseFare = selectedClass ? selectedClass.fare : 1200;
      providerName = 'Indian Railways IRCTC';
      itinerarySnapshot = {
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        originCity: train.originCity,
        originStationCode: train.originStationCode,
        destinationCity: train.destinationCity,
        destinationStationCode: train.destinationStationCode,
        departureTime: train.departureTime,
        arrivalTime: train.arrivalTime,
        classCode: selectedClass?.classCode || '3A',
        className: selectedClass?.className || 'AC 3 Tier',
      };
    } else if (travelCategory === 'bus') {
      const bus = await Bus.findById(inventoryId);
      if (!bus || !bus.isActive) {
        return res.status(404).json({ success: false, message: 'Bus service not found.' });
      }
      baseFare = bus.baseFare;
      providerName = bus.operatorName;
      itinerarySnapshot = {
        busNumber: bus.busNumber,
        operatorName: bus.operatorName,
        busType: bus.busType,
        originCity: bus.originCity,
        destinationCity: bus.destinationCity,
        departureTime: bus.departureTime,
        arrivalTime: bus.arrivalTime,
        boardingPoint: bus.boardingPoints[0]?.locationName || 'Main Station',
        droppingPoint: bus.droppingPoints[0]?.locationName || 'Central Terminal',
      };
    } else if (travelCategory === 'package') {
      baseFare = customSnapshot?.baseFare || customSnapshot?.pricing?.packagePrice || customSnapshot?.totalAmount || 25000;
      providerName = 'NOMADLY Vacation Combos';
      itinerarySnapshot = customSnapshot || { title: 'Vacation Combo Package' };
    } else if (travelCategory === 'experience') {
      if (inventoryId) {
        try {
          const exp = await Experience.findById(inventoryId);
          if (exp) {
            baseFare = exp.pricePerPerson;
            providerName = exp.meetingPoint || 'Local Certified Experience';
            itinerarySnapshot = {
              title: exp.title,
              destinationCity: exp.destinationCity,
              durationHours: exp.durationHours,
              featuredPhoto: exp.featuredPhoto,
            };
          }
        } catch {
          // fallback to custom snapshot
        }
      }
      if (!baseFare) {
        baseFare = customSnapshot?.baseFare || customSnapshot?.pricing?.baseFare || customSnapshot?.totalAmount || 2500;
        providerName = 'NOMADLY Experiences';
        itinerarySnapshot = customSnapshot || { title: 'Local Tour Experience' };
      }
    }

    // 2. Authoritative server-side price calculation
    const pricing = await PricingService.calculate({
      category: travelCategory,
      baseFare,
      quantity: resolvedPassengers.length,
      addOns,
      couponCode,
    });

    // 3. Generate unique booking reference (e.g. NOMAD-FL-4921)
    const categoryPrefix = travelCategory.substring(0, 2).toUpperCase();
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const bookingReference = `NOMAD-${categoryPrefix}-${randomDigits}`;

    const resolvedProviderName = customProviderName || providerName;

    const booking = await Booking.create({
      bookingReference,
      user: req.user._id,
      travelCategory,
      providerName: resolvedProviderName,
      providerReference: providerReference ? String(providerReference).trim() : undefined,
      isDemo: false,
      itinerarySnapshot,
      passengers: resolvedPassengers,
      contactInfo: resolvedContactInfo,
      pricing,
      bookingStatus: isDirectConfirmed ? 'confirmed' : 'pending_payment',
      paymentStatus: isDirectConfirmed ? 'paid' : 'pending',
      paymentDetails: isDirectConfirmed
        ? {
            method: 'partner_verified',
            paymentId: `ext_${Date.now()}`,
            paidAt: new Date(),
          }
        : undefined,
    });

    return res.status(201).json({
      success: true,
      message: 'Booking initialized. Proceeding to checkout.',
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const { status, category } = req.query;
    const query = { user: req.user._id };

    if (status && status !== 'all') query.bookingStatus = status;
    if (category && category !== 'all') query.travelCategory = category;

    const bookings = await Booking.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Ensure authorized access (only owner or admin)
    if (
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this booking.' });
    }

    return res.status(200).json({ success: true, data: booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { reason = 'Customer requested cancellation' } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    // Calculate refund amount: if paid, refund 90% (standard deduction 10%)
    let refundAmount = 0;
    if (booking.paymentStatus === 'paid') {
      refundAmount = Math.round(booking.pricing.totalPayable * 0.9);

      // Create refund record
      await Refund.create({
        refundReference: `REF-${Date.now()}`,
        booking: booking._id,
        amount: refundAmount,
        currency: booking.pricing.currency,
        reason,
        status: 'processed',
      });
    }

    booking.bookingStatus = 'cancelled';
    booking.cancellation = {
      isEligible: false,
      cancelledAt: new Date(),
      reason,
      refundAmount,
      refundStatus: refundAmount > 0 ? 'processed' : 'none',
    };
    if (refundAmount > 0) {
      booking.paymentStatus = 'refunded';
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookingReceipt = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const receipt = {
      receiptNumber: `REC-${booking.bookingReference}`,
      issuedAt: new Date(),
      bookingReference: booking.bookingReference,
      category: booking.travelCategory,
      provider: booking.providerName,
      customer: {
        id: booking.user,
        email: booking.contactInfo.email,
        phone: booking.contactInfo.phone,
      },
      itinerary: booking.itinerarySnapshot,
      passengers: booking.passengers,
      pricing: booking.pricing,
      payment: booking.paymentDetails,
      status: booking.bookingStatus,
      verificationQr: booking.qrCodeData,
    };

    return res.status(200).json({ success: true, data: receipt });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
