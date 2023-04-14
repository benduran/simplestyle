import React from 'react';

import createStyles, { CreateStylesOptions } from '../createStyles';
import { SimpleStyleRules } from '../types';
import { deepEqual } from '../util';

export function useCreateStyles<T extends SimpleStyleRules, K extends keyof T, O extends { [classKey in K]: string }>(
  rules: T,
  options?: Partial<Omit<CreateStylesOptions, 'flush'>>,
) {
  // state
  const [cachedRules, setCachedRules] = React.useState(() => rules);
  const [{ classes, stylesheet, updateSheet }, setCreateStyles] = React.useState(() =>
    createStyles<T, K, O>(rules, { ...options, flush: false }),
  );

  // refs
  const didFirstWriteRef = React.useRef(false);
  const styleTagRef = React.useRef(typeof document !== 'undefined' ? document.createElement('style') : null);
  const rulesRef = React.useRef(rules);
  const cachedRulesRef = React.useRef(cachedRules);

  // we leverage refs for these objects, as their referential equality is likely always changing.
  // this prevent unnecessary executions of the effects below
  rulesRef.current = rules;
  cachedRulesRef.current = cachedRules;

  // local variables
  const rulesChanged = !deepEqual(rulesRef.current, cachedRulesRef.current);

  // memos
  const styleTag = React.useMemo(() => {
    if (styleTagRef.current) return null;

    return <style dangerouslySetInnerHTML={{ __html: stylesheet }} />;
  }, [stylesheet]);

  // effects
  React.useEffect(() => {
    if (!styleTagRef.current) return;

    const { current: s } = styleTagRef;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);
  React.useEffect(() => {
    if (!styleTagRef.current) return;

    if (!didFirstWriteRef.current && !styleTagRef.current.innerHTML) {
      didFirstWriteRef.current = true;
      styleTagRef.current.innerHTML = stylesheet;
      return;
    }
    if (rulesChanged) {
      setCachedRules(rulesRef.current);
      const updated = updateSheet(rulesRef.current);
      if (updated?.stylesheet) {
        styleTagRef.current.innerHTML = updated.stylesheet;
        setCreateStyles({ ...updated, updateSheet } as any);
      }
    }
  }, [rulesChanged, stylesheet, updateSheet]);
  return React.useMemo(() => ({ classes, styleTag }), [classes, styleTag]);
}
