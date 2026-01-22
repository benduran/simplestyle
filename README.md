# simplestyle-js

An ultra-tiny, neat, easy-to-use CSS-in-JS library with SSR support,
tiny bundle size and only *one runtime dependency*.
Framework agnostic by design — works with React, Vue, Svelte, Next.js, Astro, or no framework at all.

`6.48kB` / `2.69kB gzip` ([courtesy of bundlejs.com](https://bundlejs.com/?q=simplestyle-js))

## Table of Contents
- [Install](#install)
- [Quick Start (Browser)](#quick-start-browser)
- [SSR / Static Extraction (Framework-Agnostic)](#ssr--static-extraction-framework-agnostic)
- [API Reference](#api-reference)
- [Patterns and Tips](#patterns-and-tips)
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

## Quick Start (Runtime styles in the Browser)

Use the browser entrypoint for runtime CSS injection. This variant creates `<style />` tags in the browser and is the most traditional CSS‑in‑JS experience.

```tsx
import { makeCssFuncs } from 'simplestyle-js/browser';

const { createStyles, createKeyframes, createRawStyles } = makeCssFuncs();

const { keyframe } = createKeyframes('Pulse', () => ({
  '0%': { opacity: 0.6, transform: 'scale(0.98)' },
  '100%': { opacity: 1, transform: 'scale(1)' },
}));

createRawStyles('GlobalReset', () => ({
  '*, *::before, *::after': { boxSizing: 'border-box' },
  body: { margin: 0, fontFamily: 'system-ui, sans-serif' },
}));

const { classes } = createStyles('Button', () => ({
  root: {
    backgroundColor: '#1f4aa8',
    borderRadius: 6,
    color: '#fff',
    padding: '12px 16px',
    animation: `${keyframe} 900ms ease-in-out infinite alternate`,
    '&:hover': { backgroundColor: '#2d6cdf' },
    '@media (max-width: 768px)': { padding: '10px 12px' },
  },
}));

document.querySelector('button')?.classList.add(classes.root);
```

Rules support nested selectors via `&`, media queries, and `$className` back‑references to other generated classes.

## SSR / Static Extraction (Framework‑Agnostic)

The SSR workflow requires usage of the built in `ssjs` CLI tool.
This works by scanning your source files and generating a single `.css` file, containing all of the collected styles.
Your source code remains untouched and does not require any transformation or transpilation.
To leverage this, you **must** use the SSR entrypoint and place all styles in files named with the following format:

```
*.styles.{js|cjs|mjs|ts|mts|cts|jsx|tsx}
```

Run the `ssjs` CLI to compile a single CSS file. This works with **Next.js, Astro, or any framework** (SSR or SSG) because the output is just plain CSS.

### 1) Write styles in `*.styles.*` files

```ts
// src/components/button.styles.ts
import { makeCssFuncs } from 'simplestyle-js/ssr';

const { createStyles } = makeCssFuncs();

export const { classes } = createStyles('Button', () => ({
  root: {
    backgroundColor: '#1f4aa8',
    borderRadius: 6,
    color: '#fff',
    padding: '12px 16px',
    '&:hover': { backgroundColor: '#2d6cdf' },
  },
}));
```

```tsx
// src/components/Button.tsx
import { classes } from './button.styles';

export function Button() {
  return <button className={classes.root}>Click me</button>;
}
```

### 2) Compile with `ssjs`

Define **accurate `--entrypoints`** CLI flags for your code so the compiler can follow your import graph and discover all of your styles.
The resulting CSS is written in the same order as your source code / import tree.

```bash
bun ssjs --entrypoints src/app.tsx src/pages/**/*.tsx --outfile public/my-styles.css
```
```bash
npx ssjs --entrypoints src/app.tsx src/pages/**/*.tsx --outfile public/my-styles.css
```
```bash
pnpm ssjs --entrypoints src/app.tsx src/pages/**/*.tsx --outfile public/my-styles.css
```
```bash
yarn ssjs --entrypoints src/app.tsx src/pages/**/*.tsx --outfile public/my-styles.css
```

Optional watch mode:

```bash
npx ssjs --entrypoints src/app.tsx src/pages/**/*.tsx --outfile public/my-styles.css --watch
```

### 3) Include the generated CSS

The output file is plain CSS. Include it the same way you would any stylesheet:

```html
<!-- SSR/SSG: add to your HTML head -->
<link rel="stylesheet" href="/my-styles.css" />
```

Or import it via your framework’s entry:

```ts
// e.g. Next.js or Astro entry files, or any UI application that uses a bundler
import '../public/my-styles.css';
```

## API Reference

**Important:** always call `makeCssFuncs()` from the correct entrypoint:

- Browser runtime: `import { makeCssFuncs } from 'simplestyle-js/browser'`
- SSR: `import { makeCssFuncs } from 'simplestyle-js/ssr'`

### `makeCssFuncs({ variables? }?)`

Creates the CSS helpers and optionally binds your design tokens for typed access.

```ts
import { makeCssFuncs } from 'simplestyle-js/browser'; // or import the SSR variant from 'simplestyle-js/ssr';

const { createStyles } = makeCssFuncs({
  variables: {
    colors: { brand: '#1f4aa8' },
  },
});

const { classes } = createStyles('Card', (vars) => ({
  root: { backgroundColor: vars.colors.brand },
}));
```

### `createStyles(ruleId, rulesFn, options?)`

Builds class names + CSS.
Returns `{ classes, stylesheet, updateSheet }`.
Use the returned `classes` directly in your component code / HTML.

```ts
const { classes } = createStyles('Nav', () => ({
  wrapper: { display: 'flex', gap: 12 },
  link: { '&:hover': { textDecoration: 'underline' } },
  '@media (max-width: 600px)': { wrapper: { flexDirection: 'column' } },
}));
```

Back‑reference example (use `$otherRule` to reference another generated class):

```ts
const { classes } = createStyles('Card', () => ({
  title: { fontWeight: 700, marginBottom: 8 },
  root: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f6f7fb',
    '& $title': { color: '#1f4aa8' },
  },
}));
```

### `createKeyframes(ruleId, framesFn, options?)`

Generates a unique animation name and `@keyframes` CSS. Returns `{ keyframe, stylesheet }`.

```ts
const { keyframe } = createKeyframes('FadeIn', () => ({
  '0%': { opacity: 0, transform: 'translateY(6px)' },
  '100%': { opacity: 1, transform: 'translateY(0px)' },
}));

const { classes } = createStyles('Notice', () => ({
  root: {
    animation: `${keyframe} 320ms ease-out`,
  },
}));
```

### `createRawStyles(ruleId, rulesFn, options?)`

Writes rules without generating class names. Keys must be selectors (`html`, `body *`, `.app`).

```ts
createRawStyles('GlobalReset', () => ({
  '*, *::before, *::after': { boxSizing: 'border-box' },
  'html, body': {
    margin: 0,
    padding: 0,
    fontFamily: 'system-ui, sans-serif',
    lineHeight: 1.4,
    backgroundColor: '#fff',
    color: '#111',
  },
  img: { maxWidth: '100%', display: 'block' },
  button: { font: 'inherit' },
}));
```

### `createImports(ruleId, rulesFn, options?)`

Creates `@import` rules. The array items must already be valid `@import` strings.

```ts
createImports('Imports', () => [
  '@import "https://unpkg.com/normalize.css/normalize.css"',
]);
```

### `registerPosthook(fn: (sheet: string) => string)`

Registers a transform that runs after CSS strings are generated, but before they’re flushed or written.

### Types

- `SimpleStyleRules`: `{ [selectorOrKey: string]: Properties | SimpleStyleRules }`
- `CreateStylesOptions`: options for flushing/placement in the browser runtime.
- `PosthookPlugin`: signature for `registerPosthook`.

## Patterns and Tips

- **Nested selectors**: `&` is replaced with the parent selector. Comma‑separated selectors are supported (e.g., `'&:hover, &:focus'`).
- **Back‑references**: Use `$otherRule` to reference another generated class in the same `createStyles` call (the referenced rule should appear earlier in the object).
- **Media queries**: Top‑level `@media` keys contain further rule objects.
- **Updating styles**: `updateSheet` merges new rules and updates the existing `<style>` tag (browser) or returns an updated sheet string (SSR extraction).

## Creating a simplestyle-js plugin

Do this if you want to integrate with `postcss`, `autoprefixer`, or any other CSS transformation utility you desire.

### Plugin Example (Autoprefixer)

```ts
import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import { registerPosthook } from 'simplestyle-js/browser';

registerPosthook(css => postcss([autoprefixer]).process(css, { from: undefined }).css);
```

Any future `createStyles`, `createRawStyles`, or `createKeyframes` calls will run through the posthook chain.
You can use the same API from `simplestyle-js/ssr` if you want the transform applied to extracted CSS as well.

## License
[MIT](https://en.wikipedia.org/wiki/MIT_License)
