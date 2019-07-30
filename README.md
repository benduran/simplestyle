# simplestyle-js [![Build Status](https://travis-ci.org/benduran/simplestyle.svg?branch=master)](https://travis-ci.org/benduran/simplestyle)
A super simple CSS-in-JS solution with friendly TypeScript support

## Installation
`npm install simplestyle-js --save`

## Usage

`simplestyle-js` provides three APIs out of the box:
`createStyles`, `getAllSheets` and `rawStyles`

```
import createStyles, { rawStyles } from 'simplestyle-js`;

// Useful if you want to apply Keyframes, style resets or any other global styles
rawStyles({
  html: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '16px',
  },
  'body *': {
    boxSizing: 'border-box',
  },
});

const styles = createStyles({
  myButton: {
    '&:hover': {
      backgroundColor: 'red',
    },
    backgroundColor: 'transparent',
    border: '1px solid red',
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
myHeader.class = styles.header; // Will have a generated CSS classname in the format of '.header<unique_identifier>' ex .headerumdoaudnaoqwu
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

## What this library isn't
This library isn't trying to make grandiose assumption about how your styles should be rendered. Its goal is to simply provide a typed way of 
easily creating reusable styles close to your JavaScript / TypeScript components. Eventually a plugin system will be introduced so that you can stub out
additional behaviors you might desire, but in the meantime, it is a zero-dependency way of creating CSS in JS and assumes that you're wise enough to know
whether you've made a styling mistake (wrong property, wrong unit, invalid rule format, etc)

## License
[MIT](https://en.wikipedia.org/wiki/MIT_License)