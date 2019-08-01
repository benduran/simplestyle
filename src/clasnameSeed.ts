
let globalSeed = Date.now();

export function setSeed(seed: number) { globalSeed = seed; }

export function increment() {
  if (globalSeed === Number.MAX_SAFE_INTEGER) globalSeed = 0; // Start from the beginning again
  globalSeed += 1;
}

export function get() { return globalSeed; }
