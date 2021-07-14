import { render } from '@testing-library/react';
import React from 'react';

import { useCreateStyles } from '../../src/react/useCreateStyles';

describe('React utilities tests', () => {
  it('Should verify useCreateStyles hook generates classnames', () => {
    let classes: Record<'app', string>
    const Bogus = () => {
      classes = useCreateStyles({
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
});
