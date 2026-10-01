import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

declare global {
  var mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
}

const cache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } =
  global.mongooseCache ?? { conn: null, promise: null };

global.mongooseCache = cache;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }

  cache.conn = await cache.promise;

  return cache.conn;
}

export default connectToDatabase;