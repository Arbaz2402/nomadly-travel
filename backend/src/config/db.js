import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

export const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    if (uri && uri.trim() !== '') {
      console.log('🔄 Connecting to MongoDB Cluster via MONGODB_URI...');
      await mongoose.connect(uri);
      console.log('✅ Connected to MongoDB Cluster successfully.');
      return;
    }

    console.log('⚡ No MONGODB_URI provided. Initializing High-Performance In-Memory MongoDB Server...');
    mongod = await MongoMemoryServer.create();
    const inMemoryUri = mongod.getUri();
    await mongoose.connect(inMemoryUri);
    console.log(`✅ In-Memory MongoDB running at: ${inMemoryUri}`);
    console.log('💡 Note: Data is saved in-memory and seeded automatically for rapid zero-config testing.');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    // Attempt fallback to memory server if atlas network blocked (e.g. strict IP whitelist)
    if (!mongod) {
      try {
        console.log('⚠️ Attempting fallback to In-Memory MongoDB...');
        mongod = await MongoMemoryServer.create();
        const inMemoryUri = mongod.getUri();
        await mongoose.connect(inMemoryUri);
        console.log(`✅ Fallback In-Memory MongoDB active at: ${inMemoryUri}`);
        return;
      } catch (fallbackError) {
        console.error('❌ In-Memory Fallback failed:', fallbackError.message);
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
    console.log('🛑 MongoDB disconnected cleanly.');
  } catch (error) {
    console.error('Error during database disconnect:', error.message);
  }
};
