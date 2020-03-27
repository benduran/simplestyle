
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
  it('Should generate some basic styles for a simple nested structure', () => {
    const rules: SimpleStyleRules = {
      nested: {
        '& > span': {
          fontFamily: 'Arial',
        },
        fontSize: '20px',
      },
      yarg: {
        '&:hover': {
          top: '-1px',
        },
        '&:focus': {
          backgroundColor: 'purple',
        },
      },
    };
    const [styles, styleContents] = createStyles(rules);

    expect(styles.nested).toBeDefined();
    expect(styles.nested.length).toBeGreaterThan(0);
    expect(styles.nested).toContain('nested');

    expect(styles.yarg).toBeDefined();
    expect(styles.yarg.length).toBeGreaterThan(0);
    expect(styles.yarg).toContain('yarg');

    expect(styleContents).toContain(`.${styles.nested} > span{font-family:Arial;}.${styles.nested}{font-size:20px;}`);
    expect(styleContents).toContain(`.${styles.yarg}:hover{top:-1px;}`);
    expect(styleContents).toContain(`.${styles.yarg}:focus{background-color:purple;}`);
  });
  it('Should allow backreferences', () => {
    const rules: SimpleStyleRules = {
      a: {
        textAlign: 'center',
      },
      b: {
        '& $a': {
          '&:hover': {
            fontSize: '99px',
          },
          fontSize: '30px',
        },
        lineHeight: '1.5',
      },
    };
    const [styles, styleContents] = createStyles(rules);

    expect(styleContents).toContain(`.${styles.a}{text-align:center;}`);
    expect(styleContents).toContain(`.${styles.b}{line-height:1.5;}`);
    expect(styleContents).toContain(`.${styles.b} .${styles.a}{font-size:30px;}`);
    expect(styleContents).toContain(`.${styles.b} .${styles.a}:hover{font-size:99px;}`);
  });
});
