import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import createStyles, { CreateStylesOptions } from '../createStyles';
import { SimpleStyleRules } from '../types';

export function useCreateStyles<T extends SimpleStyleRules, K extends keyof T, O extends { [classKey in K]: string }>(
  rules: T,
  options?: Partial<Omit<CreateStylesOptions, 'flush'>>,
): [O, (updatedRules: T) => void] {
  const {
    current: [styles, rawSheetContents, updateSheet],
  } = useRef(createStyles<T, K, O>(rules, { ...options, flush: false }));
  const styleTag = useRef(document.createElement('style'));

  const [sheetContents, setSheetContents] = useState(rawSheetContents);

  const handleUpdateSheet = useCallback(
    (...args: Parameters<typeof updateSheet>) => {
      const [, updatedContents] = updateSheet(...args) ?? [];
      setSheetContents(updatedContents ?? '');
    },
    [updateSheet],
  );

  useEffect(() => {
    document.head.appendChild(styleTag.current);
  }, []);

  useEffect(() => {
    styleTag.current.innerHTML = sheetContents;
  }, [sheetContents]);

  useLayoutEffect(() => {
    const { current: style } = styleTag;
    return () => style.remove();
  }, []);

  return useMemo(() => [styles, handleUpdateSheet], [styles, handleUpdateSheet]);
}
