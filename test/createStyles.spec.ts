
import { createStyles, rawStyles } from '../src';
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

    expect(styleContents).toContain(`.${styles.nested} > span{font-family:Arial;}`);
    expect(styleContents).toContain(`.${styles.nested}{font-size:20px;}`);
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
  it('Should allow simple media queries', () => {
    const rules: SimpleStyleRules = {
      responsive: {
        '@media (max-width: 960px)': {
          padding: '24px',
        },
        padding: '8px',
      },
    };
    const [styles, styleContents] = createStyles(rules);

    expect(styleContents.startsWith(`.${styles.responsive}{padding:8px;}`)).toBeTruthy();
    expect(styleContents.endsWith(`@media (max-width: 960px){.${styles.responsive}{padding:24px;}}`)).toBeTruthy();
  });
  it('Should allow multiple media queries, including deeply-nested selector', () => {
    const rules: SimpleStyleRules = {
      simple: {
        width: '100%',
      },
      deep: {
        '& > span, & > div': {
          '& button': {
            '@media(max-width: 600px)': {
              padding: '0.5em',
            },
            padding: '1em',
          },
        },
        color: 'pink',
        gridTemplateColumns: 'repeat(4, 1fr)',
      },
    };
    const [styles, styleContents] = createStyles(rules);

    expect(styleContents).toContain(`.${styles.simple}{width:100%;}`);
    expect(styleContents).toContain(`.${styles.deep}{color:pink;grid-template-columns:repeat(4, 1fr);}`);
    expect(styleContents).toContain(`.${styles.deep} > span button{padding:1em;}`);
    expect(styleContents).toContain(`.${styles.deep} > div button{padding:1em;}`);
    expect(styleContents).toContain(`@media(max-width: 600px){.${styles.deep} > div button{padding:0.5em;}}`);
    expect(styleContents).toContain(`@media(max-width: 600px){.${styles.deep} > span button{padding:0.5em;}}`);
  });
  it('Should allow creation of top-level "raw" styles that can generically apply globally to HTML tags', () => {
    const rules: SimpleStyleRules = {
      body: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '16px',
      },
      a: {
        '&:hover': {
          textDecoration: 'none',
        },
      },
    };
    const styleContents = rawStyles(rules);
    expect(styleContents).toContain('body{font-family:Arial, Helvetica, sans-serif;font-size:16px;}');
    expect(styleContents).toContain('a:hover{text-decoration:none;}');
  });
  it('Should allow creation of top-level "raw" styles with nested media queries', () => {
    const rules: SimpleStyleRules = {
      button: {
        '@media(max-width:300px)': {
          '& > svg': {
            fontSize: '1em',
          },
          maxWidth: '100%',
        },
        minWidth: '300px',
      },
    };
    const styleContents = rawStyles(rules);
    expect(styleContents).toContain('button{min-width:300px;}');
    expect(styleContents).toContain('@media(max-width:300px){button > svg{font-size:1em;}button{max-width:100%;}}');
  });
});
