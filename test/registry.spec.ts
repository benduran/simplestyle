import { beforeEach, describe, expect, it } from 'vitest';

import { SimpleStyleRegistry } from '../src/simpleStyleRegistry';
import { makeCreateStyle } from '../src/createStyles';
import { setSeed } from '../src/generateClassName';

describe('SimpleStyleRegistry', () => {
  let registry: SimpleStyleRegistry | null = null;

  beforeEach(() => {
    // we need deterministic classnames
    setSeed(0);
    registry = new SimpleStyleRegistry();
  });

  it('should check to make sure all styles are accumulated in the registry', () => {
    const createStyles = makeCreateStyle(registry!);

    const backgroundColor = 'palevioletred';
    const fontSize = '16rem';

    const { classes } = createStyles({
      root: {
        backgroundColor,
        fontSize,
      },
    });

    expect(classes.root).toContain('root');
    const styles = registry?.getCSS() ?? '';
    expect(styles).toContain(`root_a{background-color:${backgroundColor};font-size:${fontSize};}`);
    const allStyles = [...document.querySelectorAll('style')];
    expect(allStyles.length).toBe(0);
  });

  it('should ensure backreferences are replaced correctly', () => {
    const createStyles = makeCreateStyle(registry!);

    const backgroundColor = 'palevioletred';
    const fontSize = '16rem';
    const height = '500px';
    const width = '1000px';

    const { classes } = createStyles({
      someBtn: {
        height,
      },
      root: {
        backgroundColor,
        fontSize,

        '& > $someBtn': {
          width,
        },
      },
    });
    expect(classes.root).toContain('root');
    expect(classes.someBtn).toContain('someBtn');
    
    const styles = registry?.getCSS() ?? '';

    expect(styles).toContain(`.someBtn_a{height:${height};}.root_b{background-color:${backgroundColor};font-size:${fontSize};}.root_b > .someBtn_a{width:${width};}`);
  });
});
