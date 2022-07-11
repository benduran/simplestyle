import { useEffect, useMemo, useRef, useState } from 'react';

import createStyles, { CreateStylesOptions } from '../createStyles';
import { SimpleStyleRules } from '../types';
import { deepEqual } from '../util';

export function useCreateStyles<T extends SimpleStyleRules, K extends keyof T, O extends { [classKey in K]: string }>(
  rules: T,
  options?: Partial<Omit<CreateStylesOptions, 'flush'>>,
) {
  const [cachedRules, setCachedRules] = useState(() => rules);
  const cachedOptions = useMemo(() => ({ ...options } as Partial<Omit<CreateStylesOptions, 'flush'>>), [options]);
  const didFirstWriteRef = useRef(false);
  const styleTagRef = useRef(typeof document !== undefined ? document.createElement('style') : null);

  const [{ classes, stylesheet, updateSheet }, setCreateStyles] = useState(() =>
    createStyles<T, K, O>(rules, { ...cachedOptions, flush: false }),
  );

  useEffect(() => {
    if (!styleTagRef.current) return;
    const { current: s } = styleTagRef;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);
  useEffect(() => {
    if (!styleTagRef.current) return;
    if (!didFirstWriteRef.current && !styleTagRef.current.innerHTML) {
      didFirstWriteRef.current = true;
      styleTagRef.current.innerHTML = stylesheet;
      return;
    } else if (!deepEqual(rules, cachedRules)) {
      setCachedRules(rules);
      const updated = updateSheet(rules);
      if (updated?.stylesheet) {
        styleTagRef.current.innerHTML = updated.stylesheet;
        setCreateStyles({ ...updated, updateSheet } as any);
      }
    }
  }, [cachedRules, rules, stylesheet, updateSheet]);
  return classes;
}
