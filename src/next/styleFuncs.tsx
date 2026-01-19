import type { PropsWithChildren } from 'react';
import { setSeed } from '../generateClassName.js';
import { makeCssFuncs } from '../makeStyles.js';
import { getSimpleStyleRegistryForNext } from './registry.js';
import { useSafeServerInsertedHTML } from './useSafeServerInsertedHTML.js';

/**
 * variant of the makeCssFuncs function, but returns
 * ones that will work with both SSR and client components
 * in a Next.js application.
 */
export function makeNextCssFuncs<
  V extends object | undefined | null | never = never,
>({ seed, ...opts }: { seed: number; variables?: V }) {
  setSeed(seed);
  const registry = getSimpleStyleRegistryForNext();

  const out = makeCssFuncs(() => ({
    ...opts,
    registry,
  }));

  function SimpleStyleProvider({ children }: PropsWithChildren) {
    useSafeServerInsertedHTML(() => {
      const registry = getSimpleStyleRegistryForNext();
      const rulesById = registry?.getRulesById() ?? [];

      if (!rulesById.length) return null;

      return rulesById.map(([ruleId, rules]) => (
        <style
          // biome-ignore lint/security/noDangerouslySetInnerHtml: avoids escaping content when rendering
          dangerouslySetInnerHTML={{ __html: rules }}
          data-simplestyle-next-ssr
          id={ruleId}
          key={ruleId}
        />
      ));
    });

    return children;
  }

  return {
    ...out,
    registry,
    SimpleStyleProvider,
  };
}
