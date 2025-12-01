export function deepEqual<
  O1 extends Record<string | number | symbol, any>,
  O2 extends Record<string | number | symbol, any>,
>(o1: O1, o2: O2): boolean {
  // We'll sort the keys, just in case the user kept things the same but the object is all wonky, order-wise
  const o1Keys = Object.keys(o1).sort();
  const o2Keys = Object.keys(o2).sort();
  if (o1Keys.length !== o2Keys.length) return false;
  if (o1Keys.some((key, i) => o2Keys[i] !== key)) return false;
  // Okay, the keys SHOULD be the same
  // so we need to test their values, recursively, to verify equality
  return o1Keys.reduce<boolean>((prev, key) => {
    if (!prev) return prev; // we've already failed equality checks here
    if (!(key in o2)) return false;
    if (typeof o1[key] !== 'object') {
      return o1[key] === o2[key];
    }
    return deepEqual(o1[key], o2[key]);
  }, true);
}
