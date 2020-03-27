
import createStyles from '../src/createStyles';
import { SimpleStyleRules } from '../src/types';

describe('createStyles tests', () => {
  it('Should generate some basic styles', () => {
    const rules: SimpleStyleRules = {
      one: {
        display: 'flex',
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
    expect(styleContents).toContain(`.${styles.one}{display:flex;}`);
    expect(styleContents).toContain(`.${styles.two}{background-color:red;}`);
  });
});
