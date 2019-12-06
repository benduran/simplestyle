# simplestyle-js [![Build Status](https://travis-ci.org/benduran/simplestyle.svg?branch=master)](https://travis-ci.org/benduran/simplestyle)
A super simple CSS-in-JS solution with friendly TypeScript support and **zero dependencies**

## Installation
`npm install simplestyle-js --save`

## Basic Usage
```
import createStyles from 'simplestyle-js';
const styles = createStyles({
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

`simplestyle-js` provides four APIs out of the box:
`createStyles`, `getAllSheets`, `rawStyles` and `keyframes`

```
import createStyles, { rawStyles } from 'simplestyle-js`;

// Useful if you want to apply style resets or any other global styles
rawStyles({
  html: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '16px',
  },
  'body *': {
    boxSizing: 'border-box',
  },
});

const animationName = keyframes({
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

const styles = createStyles({
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

```
import createStyles, { getAllSheets } from 'simplestyle-js';

const styles = createStyles({
  nav: {
    backgroundColor: '#ccaa00',
    width: '24em',
  },
}, false); // prevents immediate flushing of the <style /> tag to the DOM
const moreStyles = createStyles({
  navButtons: {
    padding: '.5em',
  },
}, false); // prevents immediate flushing of the <style /> tag to the DOM
getAllSheets().forEach((s) => {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = s.getStyles();
  document.header.appendChild(styleTag);
  s.cleanup(); // Frees up memory for the stylesheet buffer and the internal cache of class keys to generated CSS class selectors
  // OR you can use the sheet's helper method for both of these things
  s.attach(); // Attaches to the head and cleans up the sheet buffer and the cache of class keys to generated CSS class selectors
});
```

## Authoring Plugins
There are two types of plugins:
- `prehook`
  - Called on all style rule objects *before* generating the CSS string to be used
- `posthook`
  - Called on all style rule objects *after* the CSS string has been generated, but before it has been written to the DOM in a `<style />` tag

### Prehook Plugin Example *Poor Man's Autoprefixer*
```
import createStyles, { registerPreHook } from 'simplestyle-js';

// Poor-man's autoprefixer
function prehookVendorPrefix(sheet, rules, sheetCache) {
  if (rules.boxSizing) {
    rules['-webkit-box-sizing'] = rules.boxSizing;
    rules['-moz-box-sizing'] = rules.boxSizing;
    rules['-ms-box-sizing'] = rules.boxSizing;
  }
  return rules;
}
registerPreHook(prehookVendorPrefix);
const styles = createStyles({
  preHookRoot: {
    boxSizing: 'border-box',
  },
});
const div = document.createElement('div');
div.classList.add(styles.prehookRoot); // This div will have box-sizing: border-box; as well as all of the vendor prefixes provided in the preHook transformation
document.body.appendChild(div);

// Or in a React / JSX-style component

const MyComponent = () => <div className={styles.preHookRoot}>Some stuff here</div>
```

### Posthook Plugin Example *Full Autoprefixer and PostCSS integration*
```
import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import createStyles, { registerPostHook } from 'simplestyle-js';

function posthookVendorPrefix(sheet, rules, className, sheetCache) {
  s.sheetBuffer = postcss([autoprefixer()]).process(s.getStyles()).css
}
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

- `registerPreHook(preHookFnc)`
  - `SimpleStylePluginPreHook = <T>(sheet: SimpleStylesheet, rules: ISimpleStyleRules<T>, sheetCache: ISheetCache) => ISimpleStyleRules<T>;`
  - `preHookFnc` is a function that accepts three parameters and has the format of the above TypeScript definition. The provided parameters are as follows:
    - `sheet` - `SimpleStylesheet` - Current instance of a `SimpleStylesheet` class that corresponds to the calling `createStyles` context. Each call to `createStyles` has its own `SimplStylesheet` instance created.
    - `rules` - `ISimpleStyleRules<T>` - The CSS rules object, which is an object that consists of either valid camelCased CSS properties, vendor-prefixed CSS properties (ex. `-webkit-transform`), or nested CSS selectors that further map to more `ISimpleStyleRule<T>` (like `'&:hover': { /* more rules */ }`)
    - `sheetCache` - `ISheetCache` - The global `simplestyle-js` StyleSheet cache being used to keep track of all style sheets that will be rendered to the DOM.
  - A valid `preHookFnc` is expected expected to return the `rules` object it was provided. This allows you to do additional transforms on the rules before they're flushed to a CSS string and then written to the DOM. A perfect example of this would be to use something like `postcss` with `autoprefixer` to apply all valid vendor-specific CSS properties.

- `registerPostHook(postHookFnc)`
  - `SimpleStylePluginPostHook = <T>(sheet: SimpleStylesheet, rules: ISimpleStyleRules<T>, generatedSelector: string, sheetCache: ISheetCache) => void;`
  - `postHookFnc` is a function that accepts four parameters and has the format of the above TypeScript definition. The provided parameters are as follows:
  - `sheet` - `SimpleStylesheet` - Current instance of a `SimpleStylesheet` class that corresponds to the calling `createStyles` context. Each call to `createStyles` has its own `SimplStylesheet` instance created.
  - `rules` - `ISimpleStyleRules<T>` - The CSS rules object, which is an object that consists of either valid camelCased CSS properties, vendor-prefixed CSS properties (ex. `-webkit-transform`), or nested CSS selectors that further map to more `ISimpleStyleRule<T>` (like `'&:hover': { /* more rules */ }`).
    **NOTE** The rules object, at this point, will already have all of its transforms applied to it from any executed **PreHook** functions. Modifying this object here is essentially a **NO-OP**, as the styles from this rules object will have already been written as a CSS string to this `sheet` instance (but *not* yet rendered to the DOM).
  - `generatedSelector` - `string` - The dynamically-generated CSS selector that applies to this level of the rules object. This is the selector that will have been written to a CSS string and placed inside the current `sheet` instance.
  - `sheetCache` - `ISheetCache` - The global `simplestyle-js` StyleSheet cache being used to keep track of all style sheets that will be rendered to the DOM after this stage.


## What this library isn't
This library isn't trying to make grandiose assumption about how your styles should be rendered. Its goal is to simply provide a typed way of 
easily creating reusable styles close to your JavaScript / TypeScript components. Eventually a plugin system will be introduced so that you can stub out
additional behaviors you might desire, but in the meantime, it is a zero-dependency way of creating CSS in JS and assumes that you're wise enough to know
whether you've made a styling mistake (wrong property, wrong unit, invalid rule format, etc)

## License
[MIT](https://en.wikipedia.org/wiki/MIT_License)
