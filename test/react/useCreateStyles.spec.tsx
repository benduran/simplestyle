import React from 'react';

import { render } from '@testing-library/react';

import { useCreateStyles } from '../../src/react';

describe('React hooks tests', () => {
  it('Should render a single <style /> tag with the React hooks', async () => {
    let classNameToTest = '';
    const TestComponent = () => {
      const [classes] = useCreateStyles({
        simple: {
          backgroundColor: 'pink',
        },
      });
      classNameToTest = classes.simple;
      return (
        <div className={classes.simple} data-testid='Simple'>
          Stuff
        </div>
      );
    };
    const result = render(<TestComponent />);
    const div = await result.findByTestId('Simple');
    expect(div.classList).toContain(classNameToTest);
    const styleTag = document.head.querySelector('style');
    expect(styleTag).toBeDefined();
    expect(styleTag).not.toBeNull();
    expect(styleTag?.innerHTML).toContain(`.${classNameToTest}{background-color:pink;}`);
  });
});
