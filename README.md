# simplestyle-js [![Build Status](https://travis-ci.org/benduran/simplestyle.svg?branch=master)](https://travis-ci.org/benduran/simplestyle) [![Coverage Status](https://coveralls.io/repos/github/benduran/simplestyle/badge.svg?branch=master)](https://coveralls.io/github/benduran/simplestyle?branch=master)
A super simple CSS-in-JS solution with friendly TypeScript support and a small file size

## Bundle Size
- `~5.5kB` minified
- `~2.2kB` gzipped
- Courtesy of [Bundle Phobia](https://bundlephobia.com/result?p=simplestyle-js)

## Installation
`npm install simplestyle-js --save`

## Live Demo using VanillaJS 
[Codesandbox VanillaJS Demo](https://codesandbox.io/s/gracious-browser-9hxg3r?file=/src/index.js)

## Live Demo using the provided React Hooks
[Codesandbox React Hooks Demo](https://codesandbox.io/s/nice-franklin-485wi?file=/src/App.tsx)

## Basic Usage
```javascript
import { createStyles } from 'simplestyle-js';
const { classes } = createStyles({
  myButton: {
    '&:hover': {
      backgroundColor: 'red',
    },
    '&:active, &:focus': {
      borderColor: 'blue',
    },
    backgroundColor: 'black',
    border: '1px solid',
    boxSizing: 'border-box',
    color: 'white',
  },
});
const btn = document.createElement('button');
btn.classList.add(classes.myButton);
document.body.appendChild(btn);

// Or React / JSX style component

const Button = (props) => <button {...props} className={classes.myButton}>Awesome button</button>
```

## Advanced Usage

`simplestyle-js` provides four APIs out of the box: `createStyles`, `keyframes` and `rawStyles` and `setSeed`.

```javascript
import { createStyles, rawStyles } from 'simplestyle-js';

// Allows setting global, top-level styles.
// This is useful for setting your application's overall font family, font size, box-sizing, etc
rawStyles({
  html: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '16px',
  },
  'body *': {
    boxSizing: 'border-box',
  },
  a: {
    '&:hover': {
      color: 'red',
      textDecoration: 'none',
    },
  },
});

// Generates a unique animation name and valid keyframes.
// You can then use this animation name in your CSS-in-JS styles
// in place of where you'd normally place an animation name 
const [animationName] = keyframes({
  '0%': {
    borderColor: 'red',
  },
  '50%': {
    borderColor: 'blue',
  },
  '100%': {
    borderColor: 'red',
  },
});

const { classes } = createStyles({
  myButton: {
    '&:hover': {
      backgroundColor: 'red',
    },
    '&:active, &:focus': {
      borderColor: 'blue',
    },
    // use the generated animation name from the `keyframes` call above
    animation: `${animationName} 1s linear infinite`,
    backgroundColor: 'transparent',
    border: '1px solid',
    color: 'white',
  },
  header: {
    // Media queries work great with simplestyle-js!
    '@media (max-width: 960px)': {
      '& > $myButton': {
        padding: '12px', // special padding for header button on mobile
      },
      height: '50px', // target smaller height on mobile devices
    },
    '& > $myButton': {
      padding: '4px 8px',
    },
    height: '100px',
    left: 0,
    position: 'fixed',
    right: 0,
    top: 0,
  },
}); // A new <style /> tag will appear in the header immediately after calling this function

const myHeader = document.createElement('header');
myHeader.classList.add(classes.header); // Will have a generated CSS classname in the format of '.header<unique_identifier>' ex .header_umdoaudnaoqwu

// if you want Simplestyle to always generate the same CSS class names, you can set
// your own initial seed. Assuming your modules are imported in the same order and
// execute their calls to createStyles() in the same order, the library will reliably generate
// the same classNames across successive calls.
// This is useful if you're going to be generating your stylesheets on the server
// and then rehydrating

import { createStyles, setSeed } from 'simplestyle-js';

setSeed(4567);

const { classes } = createStyles({
  someRule: {
    backgroundColor: 'red,
  },
});

// you can also update an existing stylesheet by adding or removing styles. Only applies when "flush" is set to true (it is true by default)
const { classes, styles, updateSheet } = createStyles({
  myRule: {
    height: '400px,
  },
});
const { classes: updatedClasses } = updateSheet({
  anotherRule: {
    textTransform: 'uppercase',
  },
  myRule: {
    height: '200px',
  },
}); // will update replace the existing sheet's contents and you can use the updatedClassnames here

```

```javascript
import { createStyles } from 'simplestyle-js';

const { classes, stylesheet } = createStyles({
  nav: {
    backgroundColor: '#ccaa00',
    width: '24em',
  },
}, { flush: false }); // prevents immediate flushing of the <style /> tag to the DOM
const { classes: moreClasses, stylesheet: moreSheetContents } = createStyles({
  navButtons: {
    padding: '.5em',
  },
}, { flush: false }); // prevents immediate flushing of the <style /> tag to the DOM

const styleTag = document.createElement('style');
styleTag.innerHTML = `${stylesheet}${moreSheetContents}`;
```

```javascript
/**
 * By default, simple style will insert the <style /> tags
 * it creates in the document <head />. You can change this
 * by providing either an "insertBefore" or "insertAfter"
 * DOM node.
 */

const someElement = document.getElementById('some-element');

const { classes, stylesheet } = createStyles({
  nav: {
    backgroundColor: '#ccaa00',
    width: '24em',
  },
}, { insertBefore: someElement }); // <style /> will be inserted into the DOM *before* someElement

const anotherElement = document.getElementById('another-element`);
const { classes: moreClasses, stylesheet: moreSheetContents } = createStyles({
  navButtons: {
    padding: '.5em',
  },
}, { insertAfter: anotherElement }); // <style /> will be insert into the DOM *after* anotherElement

const styleTag = document.createElement('style');
styleTag.innerHTML = `${stylesheet}${moreSheetContents}`;

```

## React Hook
`simplestyle-js` also ships with a React hook  that you can import, if you'd prefer working with hooks

```javascript
import React from 'react';
import { useCreateStyles } from 'simplestyle-js/react';


const MyComponent = () => {
  // You can dynamically update the rules object passed into useCreateStyles.
  // This is great for programmatically changing styles, colors, etc, based
  // on some user input
  const classes = useCreateStyles({
    app: {
      backgroundColor: 'purple',
      fontSize: '16px',
    },
    button: {
      padding: '1em',
    },
  });

  return (
    <div className={classes.app}>
      <button className={classes.button}>Click Me</button>
    </div>
  );
};
```

## Authoring Plugins
A recent update has removed the need for a "prehook" plugin (see previous [documentation](https://github.com/benduran/simplestyle/blob/276aac7fd8b64c6cbfced152249aac7024351092/README.md#prehook-plugin-example-poor-mans-autoprefixer) for historical purposes).
There is a single type of plugin:
- `posthook`
  - Called on all style rule objects *after* the CSS string has been generated, but before it has been written to the DOM in a `<style />` tag
- When creating a plugin, for improved SEO, it is **highly recommended** that you prefix the plugin package name with `simplestyle-js-plugin-*`.
  - See the official `postcss` Simplestyle plugin as an example: [simplestyle-js-plugin-postcss](https://www.npmjs.com/package/simplestyle-js-plugin-postcss)

### Posthook Plugin Example *Full Autoprefixer and PostCSS integration*
```javascript
import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import { createStyles, registerPostHook } from 'simplestyle-js';

const posthookVendorPrefix = sheetContents => postcss([autoprefixer()]).process(s.getStyles()).css;
registerPostHook(posthookVendorPrefix);
const styles = createStyles({
  postHookRoot: {
    userSelect: 'none',
  },
});
const div = document.createElement('div');
div.classList.add(styles.posthookRoot); // This div will have all vendor prefixed CSS properties based on how PostCSS and Autoprefixer transform the CSS
document.body.appendChild(div);

// Or in a React / JSX-style component

const MyComponent = () => <div className={styles.postHookRoot}>Some stuff here</div>
```
### Plugin API
SimpleStyle does one thing out of the box well, and that's providing an intuitive way for you to write your CSS-in-JS in ways that are very similar to popular CSS Preprocessors like LESS, SASS, Stylus, among others. If you need to provide additional functionality that's not offered in the core library, `simplestyle-js` provides easy ways to tie into lifecycle hooks in the style rendering process if you need to stub out additional behavior. This allows you to create and chain an infinite number of plugins, based on your needs. 

In order to use a plugin, you need to **register** each plugin you'd like to use *before* you issue any calls to `createStyles`. Plugins will be executed in the order in which they were registered. The methods available for you to register plugins are as follows:

- `registerPostHook(postHookFnc)`
  - `postHookFnc` is a function that accepts one parameter, which is the string contents of the sheet that should eventually be written to the DOM. This function should return a string, after you've done any desired transformations to the sheetContents.

## What this library isn't
This library isn't trying to make grandiose assumptions about how your styles should be rendered. Its goal is to simply provide a typed way of 
easily creating reusable styles close to your JavaScript / TypeScript components. It is a super compact, small file size way of creating CSS in JS and assumes that you're wise enough to know
whether you've made a styling mistake (wrong property, wrong unit, invalid rule format, etc).

There are, currently, **no plans** for creating an SSR-variant of this library, as it would be in-confict of the goal of SimpleStyle, which is to be an easy and lightweight way to use CSS-in-JS.
If you need SSR rendering in a CSS-in-JS engine, consider using [Emotion](https://emotion.sh/docs/introduction), instead.

## License
[MIT](https://en.wikipedia.org/wiki/MIT_License)
