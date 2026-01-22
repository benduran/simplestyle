import path from 'node:path';

/**
 * Given an array of file or folder paths, returns the longest
 * common parent folder path. Returns an empty string if there
 * is no common root.
 * @param {string[]} paths
 *
 * @returns {string} longest common path
 */
export function getCommonRootPath(paths) {
  if (paths.length === 0) return '';

  const resolvedPaths = paths.map((p) => path.resolve(p));
  const roots = resolvedPaths.map((p) => path.parse(p).root);

  // If roots are not shared (e.g. different drives), no common path exists.
  const firstRoot = roots[0];
  if (!roots.every((root) => root === firstRoot)) return '';

  const splitPaths = resolvedPaths.map((p) =>
    p
      .slice(firstRoot.length)
      .split(path.sep)
      .filter(Boolean),
  );

  // Start from the first path as a baseline
  const first = splitPaths[0];
  /** @type {string[]} */
  const commonSegments = [];

  for (const [i, segment] of first?.entries() ?? []) {
    // If all paths share this segment at this position, keep it
    if (splitPaths.every((parts) => parts[i] === segment)) {
      commonSegments.push(segment);
    }
  }

  // If nothing in common, return empty string
  if (commonSegments.length === 0) return firstRoot || '';

  return path.join(firstRoot, ...commonSegments);
}
