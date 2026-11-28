import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

export const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    // Enforce high-performance in-memory isolated database in test environment
    const isTestEnv = process.env.NODE_ENV === 'test';
    if (uri && uri.trim() !== '' && !isTestEnv) {
      console.log('[DB] Connecting to MongoDB...');
      await mongoose.connect(uri);
      console.log('[DB] Connected to MongoDB.');
      return;
    }

    console.log('[DB] No MONGODB_URI provided; starting in-memory MongoDB...');
    mongod = await MongoMemoryServer.create();
    const inMemoryUri = mongod.getUri();
    await mongoose.connect(inMemoryUri);
    console.log(`[DB] In-memory MongoDB running at: ${inMemoryUri}`);
  } catch (error) {
    console.error('[DB] MongoDB connection error:', error.message);
    if (!mongod) {
      try {
        console.log('[DB] Falling back to in-memory MongoDB...');
        mongod = await MongoMemoryServer.create();
        const inMemoryUri = mongod.getUri();
        await mongoose.connect(inMemoryUri);
        console.log(`[DB] Fallback in-memory MongoDB active at: ${inMemoryUri}`);
        return;
      } catch (fallbackError) {
        console.error('[DB] In-memory fallback failed:', fallbackError.message);
      }
    }
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
    console.log('[DB] MongoDB disconnected.');
  } catch (error) {
    console.error('[DB] Error during database disconnect:', error.message);
  }
};
