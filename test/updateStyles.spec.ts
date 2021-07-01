import { createStyles } from '../src';

describe('updateStyles tests', () => {
  beforeAll(() => {
    document.querySelectorAll('style').forEach(s => s.remove());
  });
  it('Should create styles, then update them without creating a new sheet', () => {
    const {
      classes: originalStyles,
      stylesheet: originalContents,
      updateSheet,
    } = createStyles({
      one: {
        backgroundColor: 'grape',
        boxSizing: 'border-box',
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
    const [updatedStyles, updatedContents] = updates!;
    expect(originalStyles).not.toBe(updatedStyles);
    expect(originalContents).not.toBe(updatedContents);
    expect(document.head.querySelectorAll('style').length).toBe(1);
    expect(document.head.querySelector('style')?.innerHTML).toBe(updatedContents);
    expect(updatedContents).toBe(`.${updatedStyles.one}{background-color:red;}`);
  });
});
