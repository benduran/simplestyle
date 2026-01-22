import { describe, expect, it } from 'vitest';
import { makeCssFuncs } from '../ssr/index.js';

describe('updateStyles tests (SSR)', () => {
  const { createStyles } = makeCssFuncs();

  it('Should create styles, then update them without creating a new sheet', () => {
    const {
      classes: originalStyles,
      stylesheet: originalContents,
      updateSheet,
    } = createStyles('update-no-new-sheet', () => ({
      one: {
        backgroundColor: 'grape',
        boxSizing: 'border-box',
      },
      two: {
        height: '100px',
      },
    }));
    expect(typeof updateSheet).toBe('function');
    const updates = updateSheet(() => ({
      one: {
        backgroundColor: 'red',
      },
    }));
    expect(updates).not.toBeNull();
    const { classes: updatedStyles, stylesheet: updatedContents } = updates!;
    expect(originalStyles).not.toBe(updatedStyles);
    expect(originalContents).not.toBe(updatedContents);
    expect(updatedContents).toBe(
      `.${updatedStyles.one}{background-color:red;box-sizing:border-box;}.${updatedStyles.two}{height:100px;}`,
    );
  });
});
