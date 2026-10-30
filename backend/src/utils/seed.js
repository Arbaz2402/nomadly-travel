import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { FlightOffer } from '../models/FlightOffer.js';
import { Hotel } from '../models/Hotel.js';
import { Train } from '../models/Train.js';
import { Bus } from '../models/Bus.js';
import { Coupon } from '../models/Coupon.js';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding NOMADLY Travel Catalog & Demo Data...');

    // 1. Seed Users
    await User.deleteMany({});
    const adminUser = await User.create({
      email: 'admin@nomadly.travel',
      displayName: 'Nomadly Administrator',
      role: 'admin',
      phoneNumber: '+91 98765 43210',
      preferences: { currency: 'INR', seatPreference: 'window', mealPreference: 'Vegetarian' },
    });

    const demoTraveler = await User.create({
      email: 'traveler@nomadly.travel',
      displayName: 'Aarav Sharma',
      role: 'customer',
      phoneNumber: '+91 91234 56789',
      preferences: { currency: 'INR', seatPreference: 'aisle', mealPreference: 'Non-Vegetarian' },
      savedTravelers: [
        {
          title: 'Mr',
          firstName: 'Aarav',
          lastName: 'Sharma',
          gender: 'male',
          dateOfBirth: new Date('1994-06-15'),
          nationality: 'Indian',
          passportNumber: 'Z8472910',
        },
        {
          title: 'Ms',
          firstName: 'Priya',
          lastName: 'Sharma',
          gender: 'female',
          dateOfBirth: new Date('1996-09-22'),
          nationality: 'Indian',
          passportNumber: 'Z9384719',
        },
      ],
    });

    // 2. Seed Flights
    await FlightOffer.deleteMany({});
    const flightsData = [
      {
        offerReference: 'FL-6E-205',
        provider: 'IndiGo Airlines',
        isDemo: true,
        originCity: 'Mumbai',
        originCode: 'BOM',
        destinationCity: 'Delhi',
        destinationCode: 'DEL',
        departureDate: '2026-11-15',
        tripType: 'one-way',
        cabinClass: 'economy',
        totalDurationMinutes: 130,
        stops: 0,
        availableSeats: 32,
        pricing: {
          currency: 'INR',
          baseFare: 4850,
          taxes: 873,
          serviceFee: 250,
          totalAmount: 5973,
        },
        baggage: { cabin: '7 kg', checkIn: '15 kg' },
        fareRules: { isRefundable: true, cancellationFee: 2500, dateChangeFee: 1500 },
        legs: [
          {
            flightNumber: '6E-205',
            airline: 'IndiGo',
            airlineCode: '6E',
            airlineLogo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&q=80',
            aircraft: 'Airbus A321neo',
            origin: { code: 'BOM', city: 'Mumbai', airport: 'Chhatrapati Shivaji Maharaj Intl', terminal: 'T2' },
            destination: { code: 'DEL', city: 'Delhi', airport: 'Indira Gandhi Intl', terminal: 'T3' },
            departureTime: new Date('2026-11-15T06:45:00Z'),
            arrivalTime: new Date('2026-11-15T08:55:00Z'),
            durationMinutes: 130,
          },
        ],
      },
      {
        offerReference: 'FL-UK-996',
        provider: 'Air India / Vistara',
        isDemo: true,
        originCity: 'Mumbai',
        originCode: 'BOM',
        destinationCity: 'Delhi',
        destinationCode: 'DEL',
        departureDate: '2026-11-15',
        tripType: 'one-way',
        cabinClass: 'business',
        totalDurationMinutes: 125,
        stops: 0,
        availableSeats: 8,
        pricing: {
          currency: 'INR',
          baseFare: 18500,
          taxes: 3330,
          serviceFee: 350,
          totalAmount: 22180,
        },
        baggage: { cabin: '12 kg', checkIn: '35 kg' },
        fareRules: { isRefundable: true, cancellationFee: 1500, dateChangeFee: 0 },
        legs: [
          {
            flightNumber: 'UK-996',
            airline: 'Vistara Club Prime',
            airlineCode: 'UK',
            airlineLogo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&q=80',
            aircraft: 'Boeing 787-9 Dreamliner',
            origin: { code: 'BOM', city: 'Mumbai', airport: 'Chhatrapati Shivaji Maharaj Intl', terminal: 'T2' },
            destination: { code: 'DEL', city: 'Delhi', airport: 'Indira Gandhi Intl', terminal: 'T3' },
            departureTime: new Date('2026-11-15T18:30:00Z'),
            arrivalTime: new Date('2026-11-15T20:35:00Z'),
            durationMinutes: 125,
          },
        ],
      },
      {
        offerReference: 'FL-QP-1384',
        provider: 'Akasa Air',
        isDemo: true,
        originCity: 'Mumbai',
        originCode: 'BOM',
        destinationCity: 'Goa',
        destinationCode: 'GOI',
        departureDate: '2026-11-18',
        tripType: 'one-way',
        cabinClass: 'economy',
        totalDurationMinutes: 70,
        stops: 0,
        availableSeats: 19,
        pricing: {
          currency: 'INR',
          baseFare: 2999,
          taxes: 540,
          serviceFee: 200,
          totalAmount: 3739,
        },
        baggage: { cabin: '7 kg', checkIn: '15 kg' },
        legs: [
          {
            flightNumber: 'QP-1384',
            airline: 'Akasa Air',
            airlineCode: 'QP',
            origin: { code: 'BOM', city: 'Mumbai', airport: 'CSMIA Terminal 1', terminal: 'T1' },
            destination: { code: 'GOI', city: 'Goa', airport: 'Manohar Intl Airport (Mopa)', terminal: 'T1' },
            departureTime: new Date('2026-11-18T11:15:00Z'),
            arrivalTime: new Date('2026-11-18T12:25:00Z'),
            durationMinutes: 70,
          },
        ],
      },
      {
        offerReference: 'FL-EK-511',
        provider: 'Emirates',
        isDemo: true,
        originCity: 'Delhi',
        originCode: 'DEL',
        destinationCity: 'Dubai',
        destinationCode: 'DXB',
        departureDate: '2026-11-20',
        tripType: 'one-way',
        cabinClass: 'economy',
        totalDurationMinutes: 240,
        stops: 0,
        availableSeats: 45,
        pricing: {
          currency: 'INR',
          baseFare: 21900,
          taxes: 3942,
          serviceFee: 450,
          totalAmount: 26292,
        },
        baggage: { cabin: '10 kg', checkIn: '30 kg' },
        legs: [
          {
            flightNumber: 'EK-511',
            airline: 'Emirates',
            airlineCode: 'EK',
            aircraft: 'Airbus A380-800',
            origin: { code: 'DEL', city: 'Delhi', airport: 'Indira Gandhi Intl', terminal: 'T3' },
            destination: { code: 'DXB', city: 'Dubai', airport: 'Dubai International Terminal 3', terminal: 'T3' },
            departureTime: new Date('2026-11-20T10:35:00Z'),
            arrivalTime: new Date('2026-11-20T13:05:00Z'),
            durationMinutes: 240,
          },
        ],
      },
    ];
    await FlightOffer.insertMany(flightsData);

    // 3. Seed Hotels
    await Hotel.deleteMany({});
    const hotelsData = [
      {
        name: 'The Taj Mahal Palace, Mumbai',
        slug: 'taj-mahal-palace-mumbai',
        brand: 'IHCL Taj',
        propertyType: 'heritage',
        starRating: 5,
        guestRating: 9.6,
        reviewsCount: 3840,
        location: {
          address: 'Apollo Bunder, Colaba',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          neighborhood: 'Gateway of India, Colaba',
        },
        overview: 'An iconic landmark overlooking the Gateway of India and the Arabian Sea, featuring legendary hospitality, award-winning fine dining restaurants, and lush grand architecture since 1903.',
        featuredPhoto: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
        ],
        amenities: ['Sea View', 'Luxury Spa', 'Swimming Pool', 'Fine Dining', 'Free High-Speed WiFi', 'Airport Limousine', 'Fitness Centre', 'Butler Service'],
        isFeatured: true,
        rooms: [
          {
            roomId: 'taj-palace-deluxe',
            name: 'Luxury Grand Room - City Facing',
            description: 'Spacious classical room blending colonial charm with modern smart luxuries.',
            pricePerNight: 24500,
            taxesPerNight: 4410,
            bedConfiguration: '1 King Bed',
            sizeSqFt: 450,
            amenities: ['King Bed', 'Marble Bathroom', 'Complimentary Breakfast', 'Butler Service'],
            photos: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80'],
            availableRooms: 6,
          },
          {
            roomId: 'taj-palace-sea-view',
            name: 'Taj Signature Suite - Arabian Sea View',
            description: 'Opulent suite with panoramic views of the Gateway of India harbor.',
            pricePerNight: 48000,
            taxesPerNight: 8640,
            bedConfiguration: '1 Royal King Bed',
            sizeSqFt: 750,
            amenities: ['Arabian Sea View', 'Jacuzzi', 'Club Lounge Access', 'Complimentary Champagne'],
            photos: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80'],
            availableRooms: 3,
          },
        ],
      },
      {
        name: 'The Oberoi Udaivilas, Udaipur',
        slug: 'oberoi-udaivilas-udaipur',
        brand: 'Oberoi Hotels',
        propertyType: 'resort',
        starRating: 5,
        guestRating: 9.8,
        reviewsCount: 2190,
        location: {
          address: 'Badi-Gorela-Mulla Talai Rd, Haridas Ji Ki Magri',
          city: 'Udaipur',
          state: 'Rajasthan',
          country: 'India',
          neighborhood: 'Lake Pichola',
        },
        overview: 'Rated among the finest resorts in the world, positioned on the romantic banks of Lake Pichola with rambling courtyards, rippling fountains, and reflection pools.',
        featuredPhoto: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
        ],
        amenities: ['Private Lake Boat Arrival', 'Semi-Private Pool', 'Ayurvedic Spa', 'Lakeside Dining', 'Free WiFi'],
        isFeatured: true,
        rooms: [
          {
            roomId: 'oberoi-premier-pool',
            name: 'Premier Room with Semi-Private Pool',
            description: 'Direct step-out access to the magnificent azure moat pool overlooking Lake Pichola.',
            pricePerNight: 36000,
            taxesPerNight: 6480,
            bedConfiguration: '1 Super King Bed',
            sizeSqFt: 600,
            amenities: ['Direct Pool Access', 'Private Garden Courtyard', 'Royal Breakfast Included'],
            photos: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80'],
            availableRooms: 4,
          },
        ],
      },
      {
        name: 'Alila Diwa Goa - Hyatt Unbound',
        slug: 'alila-diwa-goa',
        brand: 'Hyatt Unbound Collection',
        propertyType: 'resort',
        starRating: 5,
        guestRating: 9.2,
        reviewsCount: 1650,
        location: {
          address: '48/10 Adao Waddo, Majorda',
          city: 'Goa',
          state: 'Goa',
          country: 'India',
          neighborhood: 'Majorda Beach',
        },
        overview: 'Immerse yourself in lush paddy fields and serene coastal living. Featuring a dramatic infinity pool that blends seamlessly into Goan horizons.',
        featuredPhoto: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
        ],
        amenities: ['Paddy View Infinity Pool', 'Spa Alila', 'Beach Shuttle', 'Cocktail Lounge', 'Free Breakfast'],
        isFeatured: true,
        rooms: [
          {
            roomId: 'alila-terrace-room',
            name: 'Alila Terrace Room with Paddy View',
            description: 'Private open terrace overlooking soothing green fields and palm groves.',
            pricePerNight: 12500,
            taxesPerNight: 2250,
            bedConfiguration: '1 King Bed',
            sizeSqFt: 520,
            amenities: ['Open Terrace', 'Deep Soaking Tub', 'Breakfast Buffet Included'],
            photos: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80'],
            availableRooms: 8,
          },
        ],
      },
    ];
    await Hotel.insertMany(hotelsData);

    // 4. Seed Trains
    await Train.deleteMany({});
    const trainsData = [
      {
        trainNumber: '20901',
        trainName: 'Vande Bharat Express',
        trainType: 'Vande Bharat',
        originStationCode: 'MMCT',
        originStationName: 'Mumbai Central',
        originCity: 'Mumbai',
        destinationStationCode: 'GNC',
        destinationStationName: 'Gandhinagar Capital',
        destinationCity: 'Ahmedabad',
        departureTime: '06:00',
        arrivalTime: '11:25',
        durationMinutes: 325,
        daysRunning: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        punctualityScore: 98,
        cateringAvailable: true,
        stops: [
          { stationCode: 'MMCT', stationName: 'Mumbai Central', departureTime: '06:00', haltMinutes: 0 },
          { stationCode: 'BVI', stationName: 'Borivali', arrivalTime: '06:23', departureTime: '06:25', haltMinutes: 2 },
          { stationCode: 'ST', stationName: 'Surat', arrivalTime: '08:37', departureTime: '08:40', haltMinutes: 3 },
          { stationCode: 'BRC', stationName: 'Vadodara Jn', arrivalTime: '09:38', departureTime: '09:43', haltMinutes: 5 },
          { stationCode: 'ADI', stationName: 'Ahmedabad Jn', arrivalTime: '11:25', departureTime: '11:30', haltMinutes: 5 },
          { stationCode: 'GNC', stationName: 'Gandhinagar Capital', arrivalTime: '12:25', departureTime: '12:25', haltMinutes: 0 },
        ],
        classes: [
          { classCode: 'EC', className: 'Executive Chair Car (EC)', fare: 2615, availableSeats: 32, status: 'AVAILABLE', statusText: 'AVL 32' },
          { classCode: 'CC', className: 'AC Chair Car (CC)', fare: 1420, availableSeats: 74, status: 'AVAILABLE', statusText: 'AVL 74' },
        ],
      },
      {
        trainNumber: '12951',
        trainName: 'Mumbai Rajdhani Express',
        trainType: 'Rajdhani',
        originStationCode: 'MMCT',
        originStationName: 'Mumbai Central',
        originCity: 'Mumbai',
        destinationStationCode: 'NDLS',
        destinationStationName: 'New Delhi',
        destinationCity: 'Delhi',
        departureTime: '17:00',
        arrivalTime: '08:32',
        durationMinutes: 932,
        daysRunning: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        punctualityScore: 95,
        cateringAvailable: true,
        stops: [
          { stationCode: 'MMCT', stationName: 'Mumbai Central', departureTime: '17:00', haltMinutes: 0 },
          { stationCode: 'ST', stationName: 'Surat', arrivalTime: '19:43', departureTime: '19:48', haltMinutes: 5 },
          { stationCode: 'BRC', stationName: 'Vadodara Jn', arrivalTime: '21:06', departureTime: '21:16', haltMinutes: 10 },
          { stationCode: 'KOTA', stationName: 'Kota Jn', arrivalTime: '03:15', departureTime: '03:20', haltMinutes: 5 },
          { stationCode: 'NDLS', stationName: 'New Delhi', arrivalTime: '08:32', departureTime: '08:32', haltMinutes: 0 },
        ],
        classes: [
          { classCode: '1A', className: 'First AC (1A)', fare: 4950, availableSeats: 12, status: 'AVAILABLE', statusText: 'AVL 12' },
          { classCode: '2A', className: 'AC 2 Tier (2A)', fare: 2980, availableSeats: 48, status: 'AVAILABLE', statusText: 'AVL 48' },
          { classCode: '3A', className: 'AC 3 Tier (3A)', fare: 2190, availableSeats: 88, status: 'AVAILABLE', statusText: 'AVL 88' },
        ],
      },
    ];
    await Train.insertMany(trainsData);

    // 5. Seed Buses with dual-deck seat layouts
    await Bus.deleteMany({});
    const generateBusSeats = (basePrice) => {
      const seats = [];
      // Lower deck: 18 seats (row 1 to 6, col 1, 2, 3)
      for (let r = 1; r <= 6; r++) {
        seats.push({
          seatNumber: `L${r}A`,
          deck: 'lower',
          seatType: 'sleeper',
          row: r,
          column: 1,
          price: basePrice,
          isAvailable: r !== 2, // L2A taken as demo
          isBooked: r === 2,
        });
        seats.push({
          seatNumber: `L${r}B`,
          deck: 'lower',
          seatType: 'seater',
          row: r,
          column: 2,
          price: basePrice - 200,
          isAvailable: true,
          isBooked: false,
        });
        seats.push({
          seatNumber: `L${r}C`,
          deck: 'lower',
          seatType: 'seater',
          row: r,
          column: 3,
          price: basePrice - 200,
          isAvailable: r !== 4,
          isBooked: r === 4,
        });
      }
      // Upper deck: 12 sleeper berths
      for (let r = 1; r <= 6; r++) {
        seats.push({
          seatNumber: `U${r}A`,
          deck: 'upper',
          seatType: 'sleeper',
          row: r,
          column: 1,
          price: basePrice + 150,
          isAvailable: true,
          isBooked: false,
        });
        seats.push({
          seatNumber: `U${r}B`,
          deck: 'upper',
          seatType: 'sleeper',
          row: r,
          column: 3,
          price: basePrice + 150,
          isAvailable: r !== 1,
          isBooked: r === 1,
        });
      }
      return seats;
    };

    const busesData = [
      {
        operatorName: 'Zingbus Electric Superfast',
        busNumber: 'MH-04-EB-8822',
        busType: 'Volvo Multi-Axle AC Sleeper',
        originCity: 'Mumbai',
        destinationCity: 'Goa',
        departureTime: '21:30',
        arrivalTime: '08:00',
        durationMinutes: 630,
        rating: 4.8,
        reviewsCount: 840,
        baseFare: 1450,
        amenities: ['Electric Silent Ride', 'Live GPS Tracking', 'Personal Charging Port', 'Free Water Bottle', 'Sanitized Blankets', 'Reading Light'],
        boardingPoints: [
          { locationName: 'Borivali West (Gokul Hotel)', time: '21:30' },
          { locationName: 'Andheri East (Pumps & Motors)', time: '22:15' },
          { locationName: 'Vashi Plaza (Near Center One)', time: '23:20' },
        ],
        droppingPoints: [
          { locationName: 'Mapusa Bus Stand', time: '07:15' },
          { locationName: 'Panjim (KTC Bus Stand)', time: '08:00' },
        ],
        seats: generateBusSeats(1450),
      },
      {
        operatorName: 'IntrCity SmartBus Premium',
        busNumber: 'DL-01-SC-9041',
        busType: 'Mercedes Multi-Axle AC Seater',
        originCity: 'Delhi',
        destinationCity: 'Jaipur',
        departureTime: '07:00',
        arrivalTime: '12:00',
        durationMinutes: 300,
        rating: 4.7,
        reviewsCount: 1250,
        baseFare: 750,
        amenities: ['SmartBus Lounge Access', 'High-Speed WiFi', 'On-board Washroom', 'Coffee/Tea Service'],
        boardingPoints: [
          { locationName: 'Dhaula Kuan Metro Gate 1', time: '07:00' },
          { locationName: 'IFFCO Chowk Gurugram', time: '07:45' },
        ],
        droppingPoints: [
          { locationName: 'Sindhi Camp Jaipur', time: '12:00' },
        ],
        seats: generateBusSeats(750),
      },
    ];
    await Bus.insertMany(busesData);

    // 6. Seed Promotional Coupons
    await Coupon.deleteMany({});
    const couponsData = [
      {
        code: 'NOMAD10',
        title: 'Nomadly Launch Special',
        description: 'Get 10% off on any reservation up to ₹1,500',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscountAmount: 1500,
        minOrderAmount: 2000,
        applicableCategories: ['all'],
        validUntil: new Date('2027-12-31'),
        isActive: true,
      },
      {
        code: 'FLYHIGH',
        title: 'Domestic Flight Promo',
        description: 'Flat ₹800 instant discount on flight bookings',
        discountType: 'fixed',
        discountValue: 800,
        minOrderAmount: 4000,
        applicableCategories: ['flight'],
        validUntil: new Date('2027-12-31'),
        isActive: true,
      },
      {
        code: 'STAY500',
        title: 'Luxury Stay Bonus',
        description: 'Flat ₹500 off on hotel & resort bookings',
        discountType: 'fixed',
        discountValue: 500,
        minOrderAmount: 3000,
        applicableCategories: ['hotel'],
        validUntil: new Date('2027-12-31'),
        isActive: true,
      },
    ];
    await Coupon.insertMany(couponsData);

    // 7. Seed Sample Bookings for Admin Analytics
    await Booking.deleteMany({});
    const sampleBooking = await Booking.create({
      bookingReference: 'NOMAD-FL-839210',
      user: demoTraveler._id,
      travelCategory: 'flight',
      providerName: 'IndiGo Airlines',
      isDemo: true,
      itinerarySnapshot: {
        flightNumber: '6E-205',
        originCity: 'Mumbai',
        destinationCity: 'Delhi',
        cabinClass: 'economy',
        departureDate: '2026-11-15',
      },
      passengers: [
        { title: 'Mr', firstName: 'Aarav', lastName: 'Sharma', gender: 'male', seatNumber: '12A' },
      ],
      contactInfo: { email: 'traveler@nomadly.travel', phone: '+91 91234 56789' },
      pricing: {
        baseFare: 4850,
        taxes: 873,
        serviceFee: 250,
        discount: 500,
        couponCode: 'NOMAD10',
        addOnsAmount: 0,
        totalPayable: 5473,
        currency: 'INR',
      },
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
      paymentDetails: {
        orderId: 'order_seed_001',
        paymentId: 'pay_seed_001',
        method: 'mock_sandbox',
        paidAt: new Date(),
      },
      qrCodeData: JSON.stringify({ ref: 'NOMAD-FL-839210', status: 'CONFIRMED' }),
    });

    await Payment.deleteMany({});
    await Payment.create({
      orderId: 'order_seed_001',
      paymentId: 'pay_seed_001',
      booking: sampleBooking._id,
      user: demoTraveler._id,
      amount: 5473,
      currency: 'INR',
      status: 'captured',
      gateway: 'mock_sandbox',
    });

    console.log('✅ NOMADLY Database seeded successfully with Flights, Hotels, Trains, Buses, and Demo Users!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  }
};

// If run directly: node src/utils/seed.js
if (process.argv[1]?.endsWith('seed.js')) {
  import('../config/db.js').then(async ({ connectDB, disconnectDB }) => {
    await connectDB();
    await seedDatabase();
    await disconnectDB();
    process.exit(0);
  });
}
