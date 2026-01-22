import { describe, expect, it } from 'vitest';
import type { ImportStringType, SimpleStyleRules } from '../ssr/index.js';
import { makeCssFuncs } from '../ssr/index.js';

describe('createStyles tests (SSR)', () => {
  const { createStyles, createImports, createRawStyles } = makeCssFuncs();

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
    const { classes, stylesheet } = createStyles('basic-styles', () => rules);

    Object.keys(rules).forEach((key) => {
      expect(classes[key]).toBeDefined();
      expect(classes[key]?.length).toBeGreaterThan(0);
      expect(classes[key]).toContain(key);
    });
    expect(stylesheet).toContain(
      `.${classes.one}{display:flex;position:fixed;}`,
    );
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
    const { classes, stylesheet } = createStyles('basic-nested', () => rules);

    expect(classes.nested).toBeDefined();
    expect(classes.nested?.length).toBeGreaterThan(0);
    expect(classes.nested).toContain('nested');

    expect(classes.yarg).toBeDefined();
    expect(classes.yarg?.length).toBeGreaterThan(0);
    expect(classes.yarg).toContain('yarg');

    expect(stylesheet).toContain(
      `.${classes.nested} > span{font-family:Arial;}`,
    );
    expect(stylesheet).toContain(`.${classes.nested}{font-size:20px;}`);
    expect(stylesheet).toContain(`.${classes.yarg}:hover{top:-1px;}`);
    expect(stylesheet).toContain(
      `.${classes.yarg}:focus{background-color:purple;}`,
    );
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
    const { classes, stylesheet } = createStyles('backreferences', () => rules);

    expect(stylesheet).toContain(`.${classes.a}{text-align:center;}`);
    expect(stylesheet).toContain(`.${classes.b}{line-height:1.5;}`);
    expect(stylesheet).toContain(
      `.${classes.b} .${classes.a}{font-size:30px;}`,
    );
    expect(stylesheet).toContain(
      `.${classes.b} .${classes.a}:hover{font-size:99px;}`,
    );
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
    const { classes, stylesheet } = createStyles('media-queries', () => rules);

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
    const { classes, stylesheet } = createStyles(
      'multiple-media-queries',
      () => rules,
    );

    expect(stylesheet).toContain(`.${classes.simple}{width:100%;}`);
    expect(stylesheet).toContain(
      `.${classes.deep}{color:pink;grid-template-columns:repeat(4, 1fr);}`,
    );
    expect(stylesheet).toContain(
      `.${classes.deep} > span button{padding:1em;}`,
    );
    expect(stylesheet).toContain(`.${classes.deep} > div button{padding:1em;}`);
    expect(stylesheet).toContain(
      `@media(max-width: 600px){.${classes.deep} > div button{padding:0.5em;}}`,
    );
    expect(stylesheet).toContain(
      `@media(max-width: 600px){.${classes.deep} > span button{padding:0.5em;}}`,
    );
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
    const { classes, stylesheet } = createStyles(
      'media-query-with-children',
      () => rules,
    );

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
    const { classes, stylesheet } = createStyles(
      'media-query-no-clobbering',
      () => rules,
    );

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
    const { stylesheet: styleContents } = createRawStyles('raw', () => rules);

    expect(styleContents).toContain(
      'body{font-family:Arial, Helvetica, sans-serif;font-size:16px;}',
    );
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
    const { stylesheet: styleContents } = createRawStyles(
      'raw-media',
      () => rules,
    );
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
    const { classes: s1, stylesheet: rendered1 } = createStyles(
      's1',
      () => rules,
    );
    const { classes: s2, stylesheet: rendered2 } = createStyles(
      's2',
      () => rules,
    );
    const { classes: s3, stylesheet: rendered3 } = createStyles(
      's3',
      () => rules,
    );
    expect(s1).not.toEqual(s2);
    expect(s1).not.toEqual(s3);
    expect(s2).not.toEqual(s3);
    expect(rendered1).not.toEqual(rendered2);
    expect(rendered1).not.toEqual(rendered3);
    expect(rendered2).not.toEqual(rendered3);
  });
  it('should return @import rules when using the imports() function', () => {
    const theImports: ImportStringType[] = [
      "@import url('https://fonts.googleapis.com/css2?family=Funnel+Display:wght@300..800&display=swap');",
      "@import url('https://csstools.github.io/normalize.css/11.0.0/normalize.css')",
    ];
    const { stylesheet: importsStylesheet } = createImports(
      'import-rules',
      () => theImports,
    );

    const { stylesheet: rawStylesheet } = createRawStyles(
      'raw-import-subsequent-rules',
      () => ({
        'body, html': {
          fontFamily: 'Funnel Display',
          fontSize: '16px',
        },
      }),
    );

    expect(importsStylesheet).toBe(`${theImports[0]}${theImports[1]};`);
    expect(rawStylesheet).toBe(
      'body, html{font-family:Funnel Display;font-size:16px;}',
    );
  });
});
