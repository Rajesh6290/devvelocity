import mongoose from "mongoose";
import { getMongoUri } from "./serverEnv";
import { logger } from "./logger";

const MONGODB_URI = getMongoUri();

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalWithMongoose = global as typeof globalThis & {
  mongoose: MongooseCache;
};

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = { conn: null, promise: null };
}

const cached = globalWithMongoose.mongoose;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    logger.debug("DB", "Using cached MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    logger.info("DB", "Connecting to MongoDB...", {
      uri: MONGODB_URI.replace(/:\/\/[^@]+@/, "://*****@"),
    });
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((instance) => {
        logger.info("DB", "✓ MongoDB connected", {
          host: instance.connection.host,
          name: instance.connection.name,
        });
        return instance;
      })
      .catch((err: unknown) => {
        cached.promise = null;
        logger.error("DB", "✗ MongoDB connection failed", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
