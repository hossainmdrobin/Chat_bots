import { connectToDatabase } from '@/lib/db/connect';
import { UserModel } from '@/lib/models/User';
import { burnPasswordComparison, hashPassword, verifyPassword } from './password';

const DUPLICATE_KEY_ERROR = 11000;

/**
 * A duplicate key surfaces as a `MongoServerError`, which does not extend
 * `mongoose.Error`, so the driver code has to be read structurally.
 */
function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === DUPLICATE_KEY_ERROR
  );
}

export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super('An account already exists for that email address.');
    this.name = 'EmailAlreadyRegisteredError';
  }
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function isEmailRegistered(email: string) {
  await connectToDatabase();

  return Boolean(await UserModel.exists({ email: normalizeEmail(email) }));
}

/**
 * Registers a new local account. Passwords are only ever stored as a salted
 * bcrypt hash; the plain text never leaves this function.
 */
export async function createAccount({ email, password }: { email: string; password: string }) {
  await connectToDatabase();

  const passwordHash = await hashPassword(password);

  try {
    return await UserModel.create({ email: normalizeEmail(email), passwordHash });
  } catch (error) {
    // Two concurrent signups for the same address can race the unique index.
    if (isDuplicateKeyError(error)) {
      throw new EmailAlreadyRegisteredError();
    }
    throw error;
  }
}

/**
 * Resolves the signed-in user for an email/password pair, or `null` when the
 * pair does not match a registered account. The failure message is deliberately
 * identical for unknown emails and wrong passwords.
 */
export async function verifyAccount({ email, password }: { email: string; password: string }) {
  await connectToDatabase();

  const user = await UserModel.findOne({ email: normalizeEmail(email) })
    .select('+passwordHash')
    .lean();

  if (!user?.passwordHash) {
    await burnPasswordComparison(password);
    return null;
  }

  if (!(await verifyPassword(password, user.passwordHash))) {
    return null;
  }

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.email,
    image: user.profilePicture ?? null,
  };
}
