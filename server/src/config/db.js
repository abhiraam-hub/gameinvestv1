import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_mystery_room';

  try {
    // Set a quick server selection timeout so we don't hang if local mongo is down
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] Connected to external MongoDB at ${uri}`);
  } catch (err) {
    console.warn(`[Database] Could not connect to primary MongoDB at ${uri}: ${err.message}`);
    console.log('[Database] Starting in-memory MongoDB fallback...');
    
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();
      await mongoose.connect(memUri);
      console.log(`[Database] Connected to in-memory MongoDB at ${memUri}`);
    } catch (memErr) {
      console.error('[Database] Failed to start in-memory MongoDB:', memErr);
      throw memErr;
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error('[Database] MongoDB connection error:', err);
  });
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
