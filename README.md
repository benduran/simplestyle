# simplestyle-js

An ultra-tiny, neat, easy-to-use CSS-in-JS library with SSR support,
tiny bundle size and only *one runtime dependency*.

`6.06kB` / `2.55kB gzip` ([courtesy of bundlejs.com](https://bundlejs.com/?q=simplestyle-js%404.0.1))

# Simplestyle-js Reference

A concise guide to the core `simplestyle-js` APIs, how they fit together, and how to use them in browser and server-rendered apps (including Next.js).

## Table of Contents
- [Install](#install)
- [Quick Start](#quick-start)
- [API Reference](#api-reference-from-srcindexts)
- [Patterns and Tips](#patterns-and-tips)
- [SSR](#ssr)
  - [SSR steps for most SSR / SSG frameworks (including Next.js)](#ssr-steps-for-most-ssr--ssg-frameworks)
    - [1. Set your seed, create a SimpleStyleRegistry and your style functions](#1-set-your-seed-create-a-simplestyleregistry-and-your-style-functions)
    - [2. Render the generated styles in your HTML](#2-render-the-generated-styles-in-your-html)
    - [3. Create your styles and have fun!](#3-create-your-styles-and-have-fun)
- [Creating a simplestyle-js plugin](#creating-a-simplestyle-js-plugin)
  - [Plugin Example (Autoprefixer)](#plugin-example-autoprefixer)
- [License](#license)

## Install

**bun**
```
bun add simplestyle-js
```

**npm**
```
npm install simplestyle-js --save
```

**pnpm**

```
pnpm add simplestyle-js
```

**yarn**

```
yarn add simplestyle-js
```

## Quick Start

```tsx
import createStyles from 'simplestyle-js';

const { classes } = createStyles('Button', {
  root: {
    '&:hover': { backgroundColor: '#2d6cdf' },
    '@media (max-width: 768px)': { padding: '10px 12px' },
    backgroundColor: '#1f4aa8',
    borderRadius: 6,
    color: '#fff',
    padding: '12px 16px',
  },
});

document.querySelector('button')?.classList.add(classes.root);

// or, in a React / JSX-like component
const Button = (props) => <button {...props} className={classes.root}>Awesome button</button>
```

Rules support nested selectors via `&`, media queries, and `$className` back-references to other generated classes.

## API Reference

- `createStyles(ruleId, rules, options?)`
  - Builds a set of class names and CSS from a rules object. Returns `{ classes, stylesheet, updateSheet }`.
  - `options.flush` (default `true`): injects a `<style>` tag into `document.head`.
  - `options.insertBefore` / `insertAfter`: choose where the `<style>` tag is placed when flushing.
  - `options.registry`: provide a `SimpleStyleRegistry` instance to **collect** CSS instead of touching the DOM (ideal for SSR).
  - `updateSheet(updatedRules)` merges rules and updates the existing sheet (works when `flush` is `true` or a `registry` is provided). Returns `{ classes, stylesheet } | null`.
  - Example:
    ```ts
    const { classes, stylesheet } = createStyles('Nav', {
      wrapper: { display: 'flex', gap: 12 },
      link: {
        '&:hover': { textDecoration: 'underline' },
      },
      '@media (max-width: 600px)': {
        wrapper: { flexDirection: 'column' },
      },
    }, { flush: false }); // do not write to the DOM automatically
    ```

- `keyframes(ruleId, frames, options?)`
  - Generates a unique animation name and accompanying `@keyframes` CSS.
  - Returns `[animationName, stylesheet]`. Respects `flush` and `insertBefore/After` options.

- `rawStyles(ruleId, rules, options?)`
  - Writes rules without generating new class names. Keys must already be selectors (e.g., `html`, `body *`, `.app`).
  - Good for global resets or theme primitives. Respects `flush` and `registry`.

- `makeCreateStyles(registry)`
  - Convenience wrapper that returns a `createStyles` instance pre-bound to a `SimpleStyleRegistry`. Use this when you want every call to accumulate in a registry (especially useful for SSR / Server-side rendering).

- `makeRawStyles(registry)` *(from `simplestyle-js/createStyles`)*
  - Returns a `rawStyles` helper preconfigured with the provided registry; calls will auto-add to that registry instead of touching the DOM (same motivation as `makeCreateStyles` for SSR motivations).

- `makeKeyframes(registry)` *(from `simplestyle-js/createStyles`)*
  - Returns a `keyframes` helper preconfigured with the provided registry; calls will auto-add to that registry instead of touching the DOM (same motivation as `makeCreateStyles` for SSR motivations).

- `setSeed(seed: number | null)`
  - Controls the deterministic suffix used for generated class names. Setting the same seed in server and client renders keeps class names stable for hydration. Pass `null` to reset to `Date.now()`.

- `registerPosthook(fn: (sheet: string) => string)`
  - Adds a transform that runs after CSS strings are generated but before they are flushed or stored. Use for autoprefixing, minification, or custom transforms. Hooks run in registration order.

- Types
  - `SimpleStyleRules`: `{ [selectorOrKey: string]: Properties | SimpleStyleRules }` (recursive rule tree).
  - `CreateStylesOptions`: shape of the options described above.
  - `PosthookPlugin`: signature for `registerPosthook`.

## Patterns and Tips

- **Nested selectors**: `&` is replaced with the parent selector. Comma-separated selectors are supported (e.g., `'&:hover, &:focus'`).
- **Back-references**: Use `$otherRule` to reference another generated class in the same `createStyles` call.
    - **NOTE:** The `$otherRule` needs to have been declared above where you're trying to use it in a descendant selector.
- **Media queries**: Top-level `@media` keys contain further rule objects.
- **DOM placement**: `insertBefore` and `insertAfter` let you control the exact placement for where `<style />` tags will be rendered (does not apply to SSR / Server-side rendering).br
- **Updating styles**: `updateSheet` merges the new rules and updates the existing `<style>` tag (or registry entry, if you're not letting `simplestyle-js` flush to the DOM automatically for you). It also returns `{ classes, stylesheet }` so you can re-use class names if needed.

## SSR

`simplestyle-js` is intentionally unopinionated, especially when it comes to deep integrations with various frameworks. This also applies to SSR / Server-side rendering.
The core APIs needed to make this work are:

- `new SimpleStyleRegistry()` - creates a new StyleSheet registry where all of your styles will be accumulated
- `setSeed(number)` - ensures that classNames are deterministically computed and will be the same on the server and when they're rehydrated on the client
- `makeCreateStyle(registry)` - returns a `createStyles()` function that is locked to your StyleSheet registry
- `makeKeyframes(registry)` - returns a `keyframes()` function that is locaked to your StyleSheet registry

### SSR steps for most SSR / SSG frameworks (including Next.js)

#### 1. Set your seed, create a SimpleStyleRegistry and your style functions

**Note**: This file can be located anywhere in your repository.
For demonstration purposes, we'll locate this at our `src/` root, and name it `styleLib.js`

```javascript
import { makeCreateStyles, makeKeyframes, makeRawStyles, setSeed } from "simplestyle-js";
import { SimpleStyleRegistry } from "simplestyle-js/simpleStyleRegistry";

// set the className generation seed to ensure classNames are computed consistently
// between the client and the server.
// the number you use is arbitrary.
// set it higher to have most characters injected in your generated class names
setSeed(1);

// create the registry to hold all of the styles on the server
export const StyleRegistry = new SimpleStyleRegistry();

// export the style functions that will be locked to your registry
export const createStyles = makeCreateStyles(StyleRegistry);
export const keyframes = makeKeyframes(StyleRegistry);
export const rawStyles = makeRawStyles(StyleRegistry);
```

#### 2. Render the generated styles in your HTML

**Note**: If you use Next.js, you would do this in your `layout.jsx` or `layout.tsx` file.
Additionally, if you're not using React or any other JSX-inspired framework, you can use
`StyleRegistry.getHTML()` to return an HTML string with all of the `<style />` tags you need,
or `StyleRegistry.getCSS()` to just return a single, concatenated CSS string.

```jsx
import { StyleRegistry } from '../styleLib.js';

export default function Layout({ children }) {
  return (
    <body lang="en">
      {/* render your <style /> tags and set the IDs on them */}
      {StyleRegistry.getRulesById().map(([id, css]) => (
        <style id={id} key={id}>
          {css}
        </style>
      ))}
      {children}
    </body>
  );
}
```

#### 3. Create your styles and have fun!

```jsx
import { createStyles } from '../styleLib.js';

// create your styles
const { classes } = createStyles({
  awesome: {
    backgroundColor: 'purple',
    fontSize: '2rem',
    padding: '2rem',

    '& > span': {
      fontStyle: 'italic',
      fontWeight: 'bold',
      textDecoration: 'underline',
    },
  },
});

export function MyCoolComponent() {
  // use your styles here!
  return (
    <div className={classes.awesome}>
      This is super <span>cool.</span>
    </div>
  );
}
```

## Creating a simplestyle-js plugin

Do this if you want to integrate with `postcss`, `autoprefixer`, or any other CSS transformation utility you desire.

### Plugin Example (Autoprefixer)

```ts
import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import { registerPosthook } from 'simplestyle-js';

registerPosthook(css => postcss([autoprefixer]).process(css, { from: undefined }).css);
```

Any future `createStyles`, `rawStyles`, or `keyframes` calls will run through the posthook chain.

## License
[MIT](https://en.wikipedia.org/wiki/MIT_License)
