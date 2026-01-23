import { describe, expect, it } from 'vitest';
import { makeCssFuncs } from '../browser/index.js';
import { objectToHash } from '../makeStyles/generateClassName.js';
import type { SimpleStyleRules } from '../makeStyles/types.js';

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

const complexRulesWithContainer: SimpleStyleRules = {
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
    '@container (max-width: 600px)': {
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

describe('classname stability and repeatability', () => {
  const { createStyles } = makeCssFuncs();

  it('should keep prefixes from colliding while preserving stable hashes', () => {
    const expectedCardHash = objectToHash(complexRules.card as object);

    const { classes: primary } = createStyles(
      'prefix-a',
      () => ({
        ...complexRules,
      }),
      {
        flush: false,
      },
    );
    const { classes: secondary } = createStyles(
      'prefix-b',
      () => ({
        ...complexRules,
      }),
      {
        flush: false,
      },
    );

    expect(primary.card).toBe(`prefix-a_card_${expectedCardHash}`);
    expect(secondary.card).toBe(`prefix-b_card_${expectedCardHash}`);
    expect(primary.card).not.toBe(secondary.card);
  });
  it('should keep prefixes from colliding while preserving stable hashes with container queries', () => {
    const expectedCardHash = objectToHash(
      complexRulesWithContainer.card as object,
    );

    const { classes: primary } = createStyles(
      'prefix-a',
      () => ({
        ...complexRulesWithContainer,
      }),
      {
        flush: false,
      },
    );
    const { classes: secondary } = createStyles(
      'prefix-b',
      () => ({
        ...complexRulesWithContainer,
      }),
      {
        flush: false,
      },
    );

    expect(primary.card).toBe(`prefix-a_card_${expectedCardHash}`);
    expect(secondary.card).toBe(`prefix-b_card_${expectedCardHash}`);
    expect(primary.card).not.toBe(secondary.card);
  });
});
