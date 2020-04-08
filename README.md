# simplestyle-js [![Build Status](https://travis-ci.org/benduran/simplestyle.svg?branch=master)](https://travis-ci.org/benduran/simplestyle) [![Coverage Status](https://coveralls.io/repos/github/benduran/simplestyle/badge.svg?branch=master)](https://coveralls.io/github/benduran/simplestyle?branch=master)
A super simple CSS-in-JS solution with friendly TypeScript support and **zero dependencies**

## Installation
`npm install simplestyle-js --save`

## Basic Usage
```javascript
import { createStyles } from 'simplestyle-js';
const [styles] = createStyles({
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
btn.classList.add(styles.myButton);
document.body.appendChild(btn);

// Or React / JSX style component

const Button = (props) => <button {...props} className={styles.myButton}>Awesome button</button>
```

## Advanced Usage

`simplestyle-js` provides three APIs out of the box: `createStyles`, `keyframes` and `rawStyles`.

```javascript
import { createStyles, rawStyles } from 'simplestyle-js`;

// Useful if you want to apply style resets or any other global styles
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

const [styles] = createStyles({
  myButton: {
    '&:hover': {
      backgroundColor: 'red',
    },
    '&:active, &:focus': {
      borderColor: 'blue',
    },
    animation: `${animationName} 1s linear infinite`, // use the generated animation name from the `keyframes` call above
    backgroundColor: 'transparent',
    border: '1px solid',
    color: 'white',
  },
  header: {
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
myHeader.classList.add(styles.header); // Will have a generated CSS classname in the format of '.header<unique_identifier>' ex .headerumdoaudnaoqwu
```

```javascript
import { createStyles } from 'simplestyle-js';

const [styles, sheetContents] = createStyles({
  nav: {
    backgroundColor: '#ccaa00',
    width: '24em',
  },
}, { flush: false }); // prevents immediate flushing of the <style /> tag to the DOM
const [moreStyles, moreSheetContents] = createStyles({
  navButtons: {
    padding: '.5em',
  },
}, false); // prevents immediate flushing of the <style /> tag to the DOM

const styleTag = document.createElement('style');
styleTag.innerHTML = `${sheetContents}${moreSheetContents}`;
```

```javascript
import { createStyles } from 'simplestyle-js';
const [style1] = createStyles({
  nav: {
    backgroundColor: '#ccaa00',
    width: '24em',
  },
}, { accumulate: true }); // will make this sheet, and any other sheets where "accumulate: true" is used, aggregated into a single output `<style />`
const [style2] = createStyles({
  navButtons: {
    padding: '.5em',
  },
}, { accumulate: true }); // accumulating is useful if you want to minimize DOM writes
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
This library isn't trying to make grandiose assumption about how your styles should be rendered. Its goal is to simply provide a typed way of 
easily creating reusable styles close to your JavaScript / TypeScript components. Eventually a plugin system will be introduced so that you can stub out
additional behaviors you might desire, but in the meantime, it is a zero-dependency way of creating CSS in JS and assumes that you're wise enough to know
whether you've made a styling mistake (wrong property, wrong unit, invalid rule format, etc)

## License
[MIT](https://en.wikipedia.org/wiki/MIT_License)
