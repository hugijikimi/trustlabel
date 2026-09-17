/**
 * Public slugs.
 *
 * Eight characters from an alphabet with no 0, O, 1, I or l. These get read off
 * a projector and typed by hand, and they end up in other people's page source
 * for years — so legibility matters more than brevity.
 */

export const SLUG_ALPHABET = "23456789abcdefghijkmnopqrstuvwxyz";
export const SLUG_LENGTH = 8;

const UNIQUE_VIOLATION = "23505";

// The largest multiple of the alphabet length that fits in a byte. Bytes at or
// above this are rejected rather than folded, so no character is likelier than
// any other.
const CEILING = 256 - (256 % SLUG_ALPHABET.length);

export function randomSlug(length = SLUG_LENGTH) {
  const picked = [];
  const bytes = new Uint8Array(length * 2);

  while (picked.length < length) {
    crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      if (picked.length === length) break;
      if (byte >= CEILING) continue;
      picked.push(SLUG_ALPHABET[byte % SLUG_ALPHABET.length]);
    }
  }

  return picked.join("");
}

export function isUniqueViolation(error) {
  return error?.code === UNIQUE_VIOLATION;
}

/**
 * Calls `attempt(slug)` with a fresh slug until one sticks.
 *
 * Only a unique violation is retried — anything else is the caller's problem
 * and is returned straight through rather than burning attempts on it.
 */
export async function withUniqueSlug(attempt, tries = 5) {
  let lastError = null;

  for (let i = 0; i < tries; i += 1) {
    const { data, error } = await attempt(randomSlug());
    if (!error) return { data, error: null };
    if (!isUniqueViolation(error)) return { data: null, error };
    lastError = error;
  }

  return { data: null, error: lastError };
}
