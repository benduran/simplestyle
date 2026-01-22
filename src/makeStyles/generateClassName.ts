import stringifyObj from 'fast-json-stable-stringify';

/**
 * given a javascript object,
 * computes a reliable, stable
 * hash of its string representation
 */
export function objectToHash<T extends object>(obj: T) {
  // deterministically stringifty an object for a stable hash
  const str = stringifyObj(obj);

  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

/**
 * given a desired prefix and a CSS ruleset,
 * generates a stable, reliable, repeatable but unique
 * class name. if collisions are detected, an integer counter
 * is appended to the end as the sole uniquely-identifying factor
 */
export function generateClassName<T extends object>(
  prefix: string,
  obj: T,
): string {
  const hash = objectToHash(obj);
  return `${prefix}_${hash}`;
}
