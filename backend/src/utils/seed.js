import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Trip } from '../models/Trip.js';
import { ItineraryItem } from '../models/ItineraryItem.js';
import { TripExpense } from '../models/TripExpense.js';
import { TripDocument } from '../models/TripDocument.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    const existingCount = await User.countDocuments();
    if (existingCount > 0) {
      console.log('[Seed] Database already populated; skipping.');
      return;
    }
    console.log('[Seed] Seeding initial database records...');

    await User.deleteMany({});
    await User.create({
      email: 'admin@nomadly.travel',
      displayName: 'Nomadly Administrator',
      role: 'admin',
      phoneNumber: '+91 98765 43210',
      preferences: { currency: 'INR' },
    });

    const demoTraveler = await User.create({
      email: 'traveler@nomadly.travel',
      displayName: 'Aarav Sharma',
      role: 'customer',
      phoneNumber: '+91 91234 56789',
      preferences: { currency: 'INR' },
    });

    const sampleTrip = await Trip.create({
      user: demoTraveler._id,
      title: 'Golden Triangle & Heritage Rajasthan Tour',
      destination: 'Udaipur',
      additionalDestinations: ['Delhi', 'Mumbai', 'Jaipur'],
      startDate: new Date('2026-11-15'),
      endDate: new Date('2026-11-22'),
      travelersCount: 2,
      currency: 'INR',
      budget: {
        totalBudget: 85000,
        currency: 'INR',
        allocatedTransport: 25000,
        allocatedStay: 45000,
        allocatedActivities: 15000,
      },
      coverImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
      description: 'Multi-city journey across heritage forts, boutique stays, and local culinary experiences.',
      status: 'upcoming',
      participants: [
        {
          user: demoTraveler._id,
          name: 'Aarav Sharma',
          email: 'traveler@nomadly.travel',
          role: 'owner',
          status: 'accepted',
          acceptedAt: new Date(),
        },
        {
          name: 'Priya Sharma',
          email: 'priya.sharma@example.com',
          role: 'editor',
          status: 'accepted',
          acceptedAt: new Date(),
        },
      ],
    });

    await ItineraryItem.create([
      {
        trip: sampleTrip._id,
        title: 'The Oberoi Udaivilas, Lake Pichola',
        description: 'Lake-view heritage stay',
        category: 'hotel',
        sourceType: 'manual_entry',
        location: { name: 'Haridas Ji Ki Magri, Udaipur', city: 'Udaipur' },
        date: new Date('2026-11-16'),
        startTime: '14:00',
        endTime: '11:00',
        estimatedCost: 32000,
        actualCost: 32000,
        currency: 'INR',
        status: 'confirmed',
        notes: 'Breakfast & boat shuttle included.',
      },
      {
        trip: sampleTrip._id,
        title: 'City Palace Museum & Lake Sunset Cruise',
        description: 'Guided tour of Udaipur royal palace followed by Lake Pichola boat ride',
        category: 'sightseeing',
        sourceType: 'manual_entry',
        location: { name: 'City Palace Complex', city: 'Udaipur' },
        date: new Date('2026-11-19'),
        startTime: '15:30',
        endTime: '18:30',
        estimatedCost: 3500,
        actualCost: 3200,
        currency: 'INR',
        status: 'planned',
        notes: 'Sunset photography at Jag Mandir Island.',
      },
    ]);

    await TripExpense.create([
      {
        trip: sampleTrip._id,
        title: 'The Oberoi Udaivilas Stay',
        category: 'hotels',
        amount: 32000,
        currency: 'INR',
        exchangeRate: 1,
        convertedAmount: 32000,
        date: new Date('2026-11-16'),
        paidBy: { name: 'Aarav Sharma', email: 'traveler@nomadly.travel' },
        splitType: 'equal',
        splits: [
          { name: 'Aarav Sharma', email: 'traveler@nomadly.travel', shareAmount: 16000, sharePercentage: 50, isSettled: true },
          { name: 'Priya Sharma', email: 'priya.sharma@example.com', shareAmount: 16000, sharePercentage: 50, isSettled: false },
        ],
      },
      {
        trip: sampleTrip._id,
        title: 'Action Camera & Waterproof Lens (USD)',
        category: 'shopping',
        amount: 150,
        currency: 'USD',
        exchangeRate: 83.5,
        convertedAmount: 12525,
        date: new Date('2026-11-17'),
        description: 'Camera accessories for lake and palace exploration',
        paidBy: { name: 'Priya Sharma', email: 'priya.sharma@example.com' },
        splitType: 'equal',
        splits: [
          { name: 'Aarav Sharma', email: 'traveler@nomadly.travel', shareAmount: 6262.5, sharePercentage: 50, isSettled: false },
          { name: 'Priya Sharma', email: 'priya.sharma@example.com', shareAmount: 6262.5, sharePercentage: 50, isSettled: true },
        ],
      },
    ]);

    await TripDocument.create({
      trip: sampleTrip._id,
      title: 'Hotel Confirmation Voucher',
      category: 'hotel_confirmation',
      fileName: 'oberoi_udaivilas_voucher.pdf',
      fileType: 'application/pdf',
      fileSize: 2048,
      fileData: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrCg==',
      uploadedBy: demoTraveler._id,
      uploadedByName: 'Aarav Sharma',
    });

    console.log('[Seed] Database seeded successfully.');
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
  }
};

if (process.argv[1]?.endsWith('seed.js')) {
  import('../config/db.js').then(async ({ connectDB, disconnectDB }) => {
    await connectDB();
    await seedDatabase();
    await disconnectDB();
    process.exit(0);
  });
}
