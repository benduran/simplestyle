
import createStyles from '../src/createStyles';
import { SimpleStyleRules } from '../src/types';

describe('createStyles tests', () => {
  it('Should generate some basic styles', () => {
    const rules: SimpleStyleRules = {
      one: {
        display: 'flex',
        position: 'fixed',
      },
      two: {
        backgroundColor: 'red',
      },
    };
    const [styles, styleContents] = createStyles(rules);

    Object.keys(rules).forEach((key) => {
      expect(styles[key]).toBeDefined();
      expect(styles[key].length).toBeGreaterThan(0);
      expect(styles[key]).toContain(key);
    });
    expect(styleContents).toContain(`.${styles.one}{display:flex;position:fixed;}`);
    expect(styleContents).toContain(`.${styles.two}{background-color:red;}`);
  });
  it.only('Should generate some basic styles for a simple nested structure', () => {
    const rules: SimpleStyleRules = {
      nested: {
        '& > span': {
          fontFamily: 'Arial',
        },
        // fontSize: '20px',
      },
    };
    const [styles, styleContents] = createStyles(rules);
    expect(styles.nested).toBeDefined();
    expect(styles.nested.length).toBeGreaterThan(0);
    expect(styles.nested).toContain('nested');

    expect(styleContents).toBe(`.${styles.nested} > span{font-family:Arial;}.${styles.nested}{font-size:20px;}`);
  });
});
