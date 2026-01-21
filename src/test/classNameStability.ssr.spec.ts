import { describe, expect, it } from 'vitest';
import { objectToHash } from '../makeStyles/generateClassName.js';
import type { SimpleStyleRules } from '../makeStyles/types.js';
import { makeCssFuncs } from '../ssr/index.js';

const complexRules: SimpleStyleRules = {
  card: {
    padding: 0,
    lineHeight: 1.2,
    '&:hover': {
      opacity: 0.9,
      padding: 0,
    },
    '& .title, & .subtitle': {
      margin: 0,
      fontSize: '14px',
    },
    '@media (max-width: 600px)': {
      padding: '8px',
      '& .title': {
        fontSize: '12px',
      },
    },
  },
  grid: {
    display: 'grid',
    gap: 0,
    '& > *': {
      padding: 0,
    },
  },
};

describe('classname stability and repeatability (SSR)', () => {
  const { createStyles } = makeCssFuncs();

  it('should keep the hash portion stable while incrementing suffixes for repeats', () => {
    const expectedCardHash = objectToHash(complexRules.card as object);
    const expectedGridHash = objectToHash(complexRules.grid as object);

    const { classes: first } = createStyles('repeatable-rules', () => ({
      ...complexRules,
    }));
    const { classes: second } = createStyles('repeatable-rules', () => ({
      ...complexRules,
    }));

    expect(first.card).toBe(`repeatable-rules_card_${expectedCardHash}`);
    expect(first.grid).toBe(`repeatable-rules_grid_${expectedGridHash}`);
    expect(second.card).toBe(`repeatable-rules_card_${expectedCardHash}_1`);
    expect(second.grid).toBe(`repeatable-rules_grid_${expectedGridHash}_1`);
    expect(first.card).not.toBe(second.card);
    expect(first.grid).not.toBe(second.grid);
  });

  it('should keep prefixes from colliding while preserving stable hashes', () => {
    const expectedCardHash = objectToHash(complexRules.card as object);

    const { classes: primary } = createStyles('prefix-a', () => ({
      ...complexRules,
    }));
    const { classes: secondary } = createStyles('prefix-b', () => ({
      ...complexRules,
    }));

    expect(primary.card).toBe(`prefix-a_card_${expectedCardHash}`);
    expect(secondary.card).toBe(`prefix-b_card_${expectedCardHash}`);
    expect(primary.card).not.toBe(secondary.card);
  });
});
