import { useEffect, useMemo, useRef, useState } from 'react';

import createStyles, { CreateStylesOptions } from '../createStyles';
import { SimpleStyleRules } from '../types';
import { deepEqual } from '../util';

export function useCreateStyles<T extends SimpleStyleRules, K extends keyof T, O extends { [classKey in K]: string }>(
  rules: T,
  options?: Partial<Omit<CreateStylesOptions, 'flush'>>,
) {
  const cachedRules = useMemo(() => Object.create(rules) as T, [rules]);
  const cachedOptions = useMemo(
    () => Object.create(options ?? {}) as Partial<Omit<CreateStylesOptions, 'flush'>>,
    [options],
  );
  const didFirstWriteRef = useRef(false);
  const styleTagRef = useRef(document.createElement('style'));

  const [{ classes, stylesheet, updateSheet }, setCreateStyles] = useState(() =>
    createStyles<T, K, O>(rules, { ...cachedOptions, flush: false }),
  );

  useEffect(() => {
    const { current: s } = styleTagRef;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);
  useEffect(() => {
    if (!didFirstWriteRef.current) {
      didFirstWriteRef.current = true;
      styleTagRef.current.innerHTML = stylesheet;
    } else if (!deepEqual(rules, cachedRules)) {
      const updated = updateSheet(rules);
      if (updated?.stylesheet) {
        styleTagRef.current.innerHTML = updated.stylesheet;
        setCreateStyles({ ...updated, updateSheet } as any);
      }
    }
  }, [cachedRules, rules, stylesheet, updateSheet]);
  return classes;
}
