import { fireEvent, render } from '@testing-library/react';
import React, { useState } from 'react';

import { useCreateStyles } from '../../src/react/useCreateStyles';

describe('React utilities tests', () => {
  it('Should verify useCreateStyles hook generates classnames and inserts the stylesheet', () => {
    const Bogus = () => {
      const { classes } = useCreateStyles({
        app: {
          backgroundColor: 'purple',
          fontSize: '16px',
        },
      });
      return (
        <section className={classes.app} data-testid='app'>
          Testing
        </section>
      );
    };
    const result = render(<Bogus />);
    const section = result.getByTestId('app');
    expect(section.classList.length).toBeGreaterThan(0);
    expect(section.className.startsWith('app_')).toBeTruthy();
    const sheet = document.head.querySelector('style');
    expect(sheet).not.toBeNull();
    expect(sheet?.innerHTML).toContain(section.className);
    expect(sheet?.innerHTML).toContain('background-color:purple;');
    expect(sheet?.innerHTML).toContain('font-size:16px;');
  });
  it('Should verify useCreateStyles hook updates the generated styles when they change', () => {
    const Bogus = () => {
      const [changeFont, setChangeFont] = useState(false);

      const { classes } = useCreateStyles({
        button: {
          color: changeFont ? 'blue' : 'yellow',
        },
        app: {
          backgroundColor: 'purple',
          fontSize: '16px',
        },
      });
      return (
        <section className={classes.app} data-testid='app'>
          Testing
          <div>
            <button data-testid='button' className={classes.button} onClick={() => setChangeFont(true)}>
              Change Color
            </button>
          </div>
        </section>
      );
    };
    const result = render(<Bogus />);
    const button = result.getByTestId('button');
    const { className: initialButtonClassName } = button;
    fireEvent.click(button);

    const updatedButton = result.getByTestId('button');
    expect(initialButtonClassName).not.toBe(updatedButton.className);
  });
});
