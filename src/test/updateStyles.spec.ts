import { beforeAll, describe, expect, it } from 'vitest';

import { createStyles } from '../index.js';

describe('updateStyles tests', () => {
  beforeAll(() => {
    document.querySelectorAll('style').forEach((s) => {
      s.remove();
    });
  });
  it('Should create styles, then update them without creating a new sheet', () => {
    const {
      classes: originalStyles,
      stylesheet: originalContents,
      updateSheet,
    } = createStyles('update-no-new-sheet', {
      one: {
        backgroundColor: 'grape',
        boxSizing: 'border-box',
      },
      two: {
        height: '100px',
      },
    });
    expect(typeof updateSheet).toBe('function');
    const sheet = document.head.querySelector('style');
    expect(sheet?.innerHTML).toBe(originalContents);
    const updates = updateSheet({
      one: {
        backgroundColor: 'red',
      },
    });
    expect(updates).not.toBeNull();
    const { classes: updatedStyles, stylesheet: updatedContents } = updates!;
    expect(originalStyles).not.toBe(updatedStyles);
    expect(originalContents).not.toBe(updatedContents);
    expect(document.head.querySelectorAll('style').length).toBe(1);
    expect(document.head.querySelector('style')?.innerHTML).toBe(
      updatedContents,
    );
    expect(updatedContents).toBe(
      `.${updatedStyles.one}{background-color:red;box-sizing:border-box;}.${updatedStyles.two}{height:100px;}`,
    );
  });
});
