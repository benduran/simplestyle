import { useEffect, useMemo, useRef, useState } from 'react';

import createStyles, { CreateStylesOptions } from '../createStyles.js';
import { SimpleStyleRules } from '../types.js';
import { deepEqual } from '../util/index.js';

export function useCreateStyles<
  T extends SimpleStyleRules,
  K extends keyof T,
  O extends { [classKey in K]: string }
>(
  rules: T,
  options?: Partial<Omit<CreateStylesOptions, 'flush'>>,
) {
  // cache rules to compare later
  const [cachedRules, setCachedRules] = useState(() => rules);

  // memoize options but keep them live
  const cachedOptions = useMemo(
    () => ({ ...options } as Partial<Omit<CreateStylesOptions, 'flush'>>),
    [options],
  );

  const didFirstWriteRef = useRef(false);
  const styleTagRef = useRef(
    typeof document !== 'undefined' ? document.createElement('style') : null,
  );

  // initialize styles
  const [styleState, setStyleState] = useState(() =>
    createStyles<T, K, O>(rules, { ...cachedOptions, flush: false }),
  );

  const { classes, stylesheet, updateSheet } = styleState;

  // mount/unmount style tag
  useEffect(() => {
    if (!styleTagRef.current) return;
    const { current: s } = styleTagRef;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);

  // update stylesheet when rules change
  useEffect(() => {
    if (!styleTagRef.current) return;

    if (!didFirstWriteRef.current) {
      didFirstWriteRef.current = true;
      styleTagRef.current.innerHTML = stylesheet;
      return;
    }

    if (!deepEqual(rules, cachedRules)) {
      setCachedRules(rules);
      const updated = updateSheet(rules);
      if (updated) {
        styleTagRef.current.innerHTML = updated.stylesheet;
        // use the fresh updateSheet from updated
        // @ts-expect-error - this cast is safe and is only for us, internally, anyways
        setStyleState({ ...updated, updateSheet });
      }
    }
  }, [rules, updateSheet]); // only depend on rules + updater

  return classes;
}
