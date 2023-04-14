/**
 * @jest-environment node
 */

import { JSDOM } from 'jsdom';
import React from 'react';
import { renderToString } from 'react-dom/server';

import { setSeed } from '../../src';
import { useCreateStyles } from '../../src/react';

describe('React SSR Tests', () => {
  beforeEach(() => setSeed(1234));

  it('Should ensure that the React hooks inject <style /> tags above the rendered component content', () => {
    const DemoComponent = () => {
      const { classes, styleTag } = useCreateStyles({
        app: {
          backgroundColor: 'purple',
          fontSize: '16px',
        },
      });

      return (
        <>
          {styleTag}
          <main className={classes.app} data-testid='app'></main>
        </>
      );
    };

    const strHTML = renderToString(<DemoComponent />);

    const {
      window: {
        document: { body },
      },
    } = new JSDOM(`<!doctype html><html><head><title>Thing</title></head><body>${strHTML}</body></html>`);

    const appElem = body.querySelector('[data-testid="app"]');
    expect(appElem).not.toBeNull();
    expect(body.children[0].tagName).toBe('STYLE');
    expect(body.children[0].innerHTML).toContain('background-color:purple;font-size:16px;');
    expect(body.children[1]).toBe(appElem);
  });
});
