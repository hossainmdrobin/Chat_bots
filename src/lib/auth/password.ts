import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * A pre-computed hash used to keep the failed-verification cost of an unknown
 * email the same as the cost of a known one, so response timing does not leak
 * which addresses are registered.
 */
const DECOY_HASH = bcrypt.hashSync('deepagent-timing-decoy', SALT_ROUNDS);

export function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export async function burnPasswordComparison(password: string) {
  await bcrypt.compare(password, DECOY_HASH);
}
