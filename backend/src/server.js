import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Automatically locate .env from either backend or root directory
const envPath = fs.existsSync('.env')
  ? '.env'
  : fs.existsSync('backend/.env')
  ? 'backend/.env'
  : path.resolve(process.cwd(), '../.env');

dotenv.config({ path: envPath });

import app from './app.js';
import { connectDB } from './config/db.js';
import { seedDatabase } from './utils/seed.js';
import { FlightOffer } from './models/FlightOffer.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Establish Database Connection
    await connectDB();

    // 2. Check if database has catalog, seed if empty
    const flightCount = await FlightOffer.countDocuments();
    if (flightCount === 0) {
      console.log('📦 Empty database detected. Seeding initial travel catalog...');
      await seedDatabase();
    }

    // 3. Start Listening
    app.listen(PORT, () => {
      console.log(`🚀 NOMADLY API Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`🌐 Base URL: http://localhost:${PORT}/api/v1`);
      console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Fatal Server Startup Error:', error);
    process.exit(1);
  }
};

startServer();
