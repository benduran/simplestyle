import { createStyles, rawStyles, setSeed } from '../src';
import { SimpleStyleRules } from '../src/types';

describe('createStyles tests', () => {
  beforeEach(() => {
    Array.from(document.querySelectorAll('style')).forEach(s => s.remove());
  });
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
    const { classes, stylesheet } = createStyles(rules);

    Object.keys(rules).forEach(key => {
      expect(classes[key]).toBeDefined();
      expect(classes[key]?.length).toBeGreaterThan(0);
      expect(classes[key]).toContain(key);
    });
    expect(stylesheet).toContain(`.${classes.one}{display:flex;position:fixed;}`);
    expect(stylesheet).toContain(`.${classes.two}{background-color:red;}`);
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
    const { classes, stylesheet } = createStyles(rules);

    expect(classes.nested).toBeDefined();
    expect(classes.nested?.length).toBeGreaterThan(0);
    expect(classes.nested).toContain('nested');

    expect(classes.yarg).toBeDefined();
    expect(classes.yarg?.length).toBeGreaterThan(0);
    expect(classes.yarg).toContain('yarg');

    expect(stylesheet).toContain(`.${classes.nested} > span{font-family:Arial;}`);
    expect(stylesheet).toContain(`.${classes.nested}{font-size:20px;}`);
    expect(stylesheet).toContain(`.${classes.yarg}:hover{top:-1px;}`);
    expect(stylesheet).toContain(`.${classes.yarg}:focus{background-color:purple;}`);
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
    const { classes, stylesheet } = createStyles(rules);

    expect(stylesheet).toContain(`.${classes.a}{text-align:center;}`);
    expect(stylesheet).toContain(`.${classes.b}{line-height:1.5;}`);
    expect(stylesheet).toContain(`.${classes.b} .${classes.a}{font-size:30px;}`);
    expect(stylesheet).toContain(`.${classes.b} .${classes.a}:hover{font-size:99px;}`);
  });
  it('Should allow simple media queries', () => {
    const rules: SimpleStyleRules = {
      responsive: {
        '@media (max-width: 960px)': {
          '& button': {
            padding: '24px',
          },
        },
        '& button': {
          padding: '8px',
        },
      },
    };
    const { classes, stylesheet } = createStyles(rules);

    expect(stylesheet).toBe(
      `.${classes.responsive} button{padding:8px;}@media (max-width: 960px){.${classes.responsive} button{padding:24px;}}`,
    );
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
    const { classes, stylesheet } = createStyles(rules);

    expect(stylesheet).toContain(`.${classes.simple}{width:100%;}`);
    expect(stylesheet).toContain(`.${classes.deep}{color:pink;grid-template-columns:repeat(4, 1fr);}`);
    expect(stylesheet).toContain(`.${classes.deep} > span button{padding:1em;}`);
    expect(stylesheet).toContain(`.${classes.deep} > div button{padding:1em;}`);
    expect(stylesheet).toContain(`@media(max-width: 600px){.${classes.deep} > div button{padding:0.5em;}}`);
    expect(stylesheet).toContain(`@media(max-width: 600px){.${classes.deep} > span button{padding:0.5em;}}`);
  });
  it('Should allow a media query with multiple children', () => {
    const rules: SimpleStyleRules = {
      appHeaderHomeLink: {
        '@media (max-width: 600px)': {
          '& > b': {
            display: 'none',
          },
          '& > i': {
            marginLeft: '0 !important',
          },
        },
        position: 'relative',
        transition: 'background-color .2s ease',
      },
    };
    const { classes, stylesheet } = createStyles(rules);

    // eslint-disable-next-line max-len
    expect(stylesheet).toBe(
      `.${classes.appHeaderHomeLink}{position:relative;transition:background-color .2s ease;}@media (max-width: 600px){.${classes.appHeaderHomeLink} > b{display:none;}.${classes.appHeaderHomeLink} > i{margin-left:0 !important;}}`,
    );
  });
  it("Should ensure that multiple media queries of the same type aren't clobbered", () => {
    const mediaQuery = '@media (max-width: 600px)';
    const rules: SimpleStyleRules = {
      appBarGrid: {
        [mediaQuery]: {
          gridTemplateColumns: '1fr 2fr',
        },
      },
      appHeaderHomeLink: {
        [mediaQuery]: {
          '& > b': {
            display: 'none',
          },
        },
      },
    };
    const { classes, stylesheet } = createStyles(rules);

    expect(stylesheet).toBe(
      `${mediaQuery}{.${classes.appBarGrid}{grid-template-columns:1fr 2fr;}}${mediaQuery}{.${classes.appHeaderHomeLink} > b{display:none;}}`,
    );
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
    expect(styleContents).toBe(
      'button{min-width:300px;}@media(max-width:300px){button > svg{font-size:1em;}button{max-width:100%;}}',
    );
  });
  it('Should generate different classnames across multiple passes', () => {
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
      finder: {
        backgroundColor: 'pink',
        marginLeft: '40px',
        padding: '1rem',
      },
    };
    const { classes: s1, stylesheet: rendered1 } = createStyles(rules, { flush: false });
    const { classes: s2, stylesheet: rendered2 } = createStyles(rules, { flush: false });
    const { classes: s3, stylesheet: rendered3 } = createStyles(rules, { flush: false });
    expect(s1).not.toEqual(s2);
    expect(s1).not.toEqual(s3);
    expect(s2).not.toEqual(s3);
    expect(rendered1).not.toEqual(rendered2);
    expect(rendered1).not.toEqual(rendered3);
    expect(rendered2).not.toEqual(rendered3);
  });
  it('Should generate the same classnames across multiple passes if a custom seed is set', () => {
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
      finder: {
        backgroundColor: 'pink',
        marginLeft: '40px',
        padding: '1rem',
      },
    };
    const seed = 1234;
    setSeed(seed);
    const { classes: s1, stylesheet: rendered1 } = createStyles(rules, { flush: false });
    setSeed(seed);
    const { classes: s2, stylesheet: rendered2 } = createStyles(rules, { flush: false });
    setSeed(seed);
    const { classes: s3, stylesheet: rendered3 } = createStyles(rules, { flush: false });
    expect(s1).toEqual(s2);
    expect(s1).toEqual(s3);
    expect(s2).toEqual(s3);
    expect(rendered1).toEqual(rendered2);
    expect(rendered1).toEqual(rendered3);
    expect(rendered2).toEqual(rendered3);
  });
  it('Should generate styles and allow inserting after a desired element', () => {
    const insertAfter = document.createElement('div');
    document.body.appendChild(insertAfter);
    const { stylesheet: styleContents } = createStyles(
      {
        test: {
          backgroundColor: 'purple',
          fontSize: '40px',
        },
      },
      { insertAfter },
    );
    const foundStyle = document.body.querySelector('style');
    expect(foundStyle?.innerHTML).toBe(styleContents);
    const children = Array.from(document.body.children);
    let success = false;
    for (let i = 0; i < children.length; i += 1) {
      const child = children[i];
      if (child === insertAfter) {
        success = true;
        expect(children[i + 1]).toBe(foundStyle);
        break;
      }
    }
    expect(success).toBeTruthy();
  });
  it('Should generate styles and allow inserting before desired element', () => {
    const insertBefore = document.createElement('div');
    document.body.appendChild(insertBefore);
    const { stylesheet: styleContents } = createStyles(
      {
        test: {
          backgroundColor: 'purple',
          fontSize: '40px',
        },
      },
      { insertBefore },
    );
    const foundStyle = document.body.querySelector('style');
    expect(foundStyle?.innerHTML).toBe(styleContents);
    const children = Array.from(document.body.children);
    let success = false;
    for (let i = 0; i < children.length; i += 1) {
      const child = children[i];
      if (child === insertBefore) {
        success = true;
        expect(children[i - 1]).toBe(foundStyle);
        break;
      }
    }
    expect(success).toBeTruthy();
  });
});
