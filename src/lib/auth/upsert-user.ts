import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db/connect';
import { UserModel } from '@/lib/models/User';

interface UpsertUserInput {
  email: string;
  profilePicture?: string | null;
}

const DUPLICATE_KEY_ERROR = 11000;

/**
 * Creates the Mongo user for a Google account on first sign-in and keeps the
 * stored profile picture in sync afterwards. Never overwrites an existing email.
 */
export async function upsertUser({ email, profilePicture }: UpsertUserInput) {
  await connectToDatabase();

  const update = profilePicture
    ? { $set: { profilePicture }, $setOnInsert: { email } }
    : { $setOnInsert: { email } };

  try {
    return await UserModel.findOneAndUpdate(
      { email },
      update,
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    ).lean();
  } catch (error) {
    // Two concurrent first sign-ins can race the unique email index.
    if (error instanceof mongoose.Error && 'code' in error && error.code === DUPLICATE_KEY_ERROR) {
      return UserModel.findOneAndUpdate(
        { email },
        profilePicture ? { $set: { profilePicture } } : {},
        { returnDocument: 'after' }
      ).lean();
    }
    throw error;
  }
}

export default upsertUser;