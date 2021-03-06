# Flair

> a lean, component-centric style system for React components

## ⚠️ This library is still in heavy development with the best features coming soon (development on hiatus)

Watch releases to be notified for new features.

## Features

- 🎣 hooks API
- 👩‍🎨 theming
- 🎨 advanced color context features including **dark mode**
- 🧩 composable styles by default
- 📦 small size, [7.3kB](https://bundlephobia.com/result?p=flair)
- 👩‍🎨 full color manipulation library included ([colork2k](https://github.com/ricokahler/color2k)) (no need for chroma-js or polished)
- ⛓ full TypeScript support and enhanced DX

**Experimental features**

The best features of this library are still in development:

- static and extracted CSS similar to [Linaria](https://github.com/callstack/linaria) via a [Babel Plugin](https://github.com/ricokahler/flair/tree/master/packages/babel-plugin-plugin) (this will become the preferred way to use the library when stable)
- SSR support
- much smaller bundle [2.5kB](https://bundlephobia.com/result?p=@flair/ssr)
- performance improvements

**Requirements**

- React `>16.8.0` (requires hooks)
- No IE 11 support

**Table of contents**

- [Flair](#flair)
  - [Features](#features)
  - [Why another CSS-in-JS lib?](#why-another-css-in-js-lib)
  - [Installation](#installation)
    - [Install](#install)
    - [Create your theme](#create-your-theme)
    - [Provider installation](#provider-installation)
    - [Add type augments](#add-type-augments)
    - [VS Code extension](#vs-code-extension)
  - [Usage](#usage)
    - [Basic usage](#basic-usage)
    - [Composability](#composability)
    - [Dynamic coloring](#dynamic-coloring)
    - [Color system usage](#color-system-usage)
    - [Theming usage](#theming-usage)
  - [Implementations](#implementations)
    - [How does this all work?](#how-does-this-all-work)
    - [Enabling the experiemental SSR mode (`@flair/ssr`)](#enabling-the-experiemental-ssr-mode-flairssr)
    - [Configure babel](#configure-babel)
    - [Configure Webpack](#configure-webpack)

## Why another CSS-in-JS lib?

[Glad you asked! See here for more info.](./why-another-css-in-js-lib.md)

## Installation

### Install

```
npm i --save flair
```

### Create your theme

`flair`'s theming works by providing an object to all your components. This theme object should contain values to keep your app's styles consistent.

[See theming usage for more info](#theming-usage)

```ts
// /src/theme.ts (or /src/theme.js)

const theme = {
  // see theming usage for more info
  colors: {
    brand: 'palevioletred',
    accent: 'peachpuff',
    surface: 'white',
  },
};

export default theme;
```

### Provider installation

```tsx
// index.ts (or index.js)
import React from 'react';
import { ThemeProvider, ColorContextProvider } from 'flair';
import { render } from 'react-dom';
import theme from './theme';
import App from './App';

const container = document.querySelector('#root');

render(
  <ThemeProvider theme={theme}>
    <ColorContextProvider
      color={theme.colors.accent}
      surface={theme.colors.surface}
    >
      <App />
    </ColorContextProvider>
  </ThemeProvider>,
  container,
);
```

### Add type augments

If you're using typescript or an editor that supports the typescript language service (VS Code), you'll need to add one more file to configure the types and intellisense.

Place this file at the root of your project.

```tsx
// /arguments.d.ts
import {
  StyleFnArgs,
  ReactComponent,
  StyleProps,
  GetComponentProps,
} from 'flair';

declare module 'flair' {
  // this should import your theme
  type Theme = typeof import('./src/theme').default;

  // provides an override type that includes the type for your theme
  export function useTheme(): Theme;

  // provides an override type that includes the type for your theme
  export function createStyles<Styles, ComponentType extends ReactComponent>(
    stylesFn: (args: StyleFnArgs<Theme>) => Styles,
  ): <Props extends StyleProps<Styles>>(
    props: Props,
    component?: ComponentType,
  ) => {
    Root: React.ComponentType<GetComponentProps<ComponentType>>;
    styles: { [P in keyof Styles]: string } & {
      cssVariableObject: { [key: string]: string };
    };
  } & Omit<Props, keyof StyleProps<any>>;
}
```

### VS Code extension

If you're using VSCode, we recommend installing the `vscode-styled-components` by [the styled-components team](https://github.com/styled-components/vscode-styled-components). This will add syntax highlighting for our style of CSS-in-JS.

## Usage

### Basic usage

```tsx
// Card.tsx
import React from 'react';
import { createStyles, PropsFromStyles } from 'flair';

// `flair` works by creating a hook that intercepts your props
const useStyles = createStyles(({ css, theme }) => ({
  // here you return an object of styles
  root: css`
    padding: 1rem;
    background-color: peachpuff;
    /* you can pull in your theme like so */
    border-right: 5px solid ${theme.colors.brand};
  `,
  title: css`
    font-weight: bold;
    font-weight: 3rem;
    margin-bottom: 1rem;
  `,
  description: css`
    line-height: 1.5;
  `,
}));

// write your props like normal, just add the `extends…` like so:
interface Props extends PropsFromStyles<typeof useStyles> {
  title: React.ReactNode;
  description: React.ReactNode;
}

function Card(props: Props) {
  // `useStyles` intercepts your props
  const {
    // `Root` and `styles` are props added via `useStyles`
    Root,
    styles,
    // `title` and `description` are the props you defined
    title,
    description,
  } = useStyles(props, 'div' /* 👈 `div` is the default if you omit this */);

  return (
    // the `root` class is automatically applied to the `Root` component
    <Root
      onClick={() => {
        // you can supply any props you would send to the root component
        // (which is a `div` in this case)
      }}
    >
      {/* the styles that come back are class names */}
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
    </Root>
  );
}

export default Card;
```

### Composability

`flair`'s styles are composable by default. This means that every style you write can be augmented because the style props `className`, `style`, and `styles` are automatically propagated to the subject `Root` component.

Building from the example above:

```tsx
// Grid.tsx
import React from 'react';
import { createStyles, PropsFromStyles } from 'flair';
import Cart from './Card';

const useStyles = createStyles(({ css }) => ({
  root: css`
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(3, 1fr);
  `,
  card: css`
    box-shadow: 0 0 45px 0 rgba(0, 0, 0, 0.2);
  `,
  titleUnderlined: css`
    text-decoration: underlined;
  `,
}));

interface Props extends PropsFromStyles<typeof useStyles> {}

function Grid(props: Props) {
  const { Root, styles } = useStyles(props);

  return (
    <Root>
      <Card
        // augments the `root` class in the Card
        className={styles.card}
        styles={{
          // augments the `title` class in `Card`
          title: styles.titleUnderlined,
        }}
        title="flair"
        description={
          <>a lean, component-centric style system for React components</>
        }
      />

      <Card
        className={styles.card}
        title="emotion"
        description={
          <>CSS-in-JS library designed for high performance style composition</>
        }
      />

      <Card
        className={styles.card}
        title="styled-components"
        description={
          <>
            Visual primitives for the component age. Use the best bits of ES6
            and CSS to style your apps without stress
          </>
        }
      />
    </Root>
  );
}
```

### Dynamic coloring

Every component styled with `flair` supports dynamic coloring. This means you can pass the prop `color` to it and use that color when defining styles.

```tsx
// passing the color prop
<Button color="red">My Red Button</Button>
```

```tsx
// using the color prop to define styles
import React from 'react';
import { createStyles, PropsFromStyles } from 'flair';

// the `color` prop comes through here  👇
const useStyles = createStyles(({ css, color, surface }) => ({
  //                                           👆
  // additionally, there is another prop `surface` that hold the color of the
  // surface this component is on currently. this is usually black for dark mode
  // and white for non-dark modes
  root: css`
    border: 1px solid ${color.decorative};
    background-color: ${surface};
    color: ${color.readable};
  `,
}));

interface Props extends PropsFromStyles<typeof useStyles> {
  children: React.ReactNode;
  onClick: () => void;
}

function Button(props: Props) {
  const { Root, children, onClick } = useStyles(props, 'children');
  return <Root onClick={onClick}>{children}</Root>;
}

export default Button;
```

[See this demo in CodeSandbox](https://codesandbox.io/s/dynamic-coloring-7dr3n)

### Color system usage

`flair` ships with a simple yet robust color system. You can wrap your components in `ColorContextProvider`s to give your components context for what color they should expect to be on top of. This works well when supporting dark mode.

[See here for a full demo of color context.](https://codesandbox.io/s/nested-color-system-demo-qphro)

### Theming usage

Theming in `flair` is implemented as one object that will be available to all your components in the app. You can use this object to store values to make your app's styles consistent. We recommend referring to [`material-ui`'s theme object](https://material-ui.com/customization/default-theme/#default-theme) for idea on how to define your own theme's shape.

Wrap your App in a `ThemeProvider` and give that `ThemeProvider` a theme object.

After your wrap in a theme provider, you can access the theme via the args in `createStyles`:

```tsx
//                                     👇👇👇
const useStyles = createStyles(({ css, theme }) => ({
  root: css`
    color: ${theme.colors.brand};
  `,
}));
```

And inside your component. You can access the theme via `useTheme()`

```tsx
function Component(props: Props) {
  const theme = useTheme();

  // ...
}
```

## Implementations

This repo has two implementations that are better suited for different environments/setups.

Both implementations share the exact same API and even use the same import (the SSR version rewrites the imports via the babel plugin).

In general, the standalone implementation is easier to get started with, works in more environments, and is currently much more stable than the SSR counterpart.

With the existence of both versions, you can get started using the standalone version and optimize later with the SSR version.

<!-- prettier-ignore-start -->
| Feature | `@flair/standalone` | `@flair/ssr` |
|--|--|--|
| Works standalone without any babel plugins or webpack loaders (for `create-react-app` support) | ✅ | 🔴 |
| Zero config | ✅ | 🔴 |
| Faster, static CSS 🚀 | 🔴 | ✅ |
| Extracts CSS from JS bundle | 🔴 | ✅ |
| Stability | 👍 beta | 🤔 experimental |
| Bundle size | [7.3kB](https://bundlephobia.com/result?p=@flair/standalone) 🤷‍♀️ | [2.5kB](https://bundlephobia.com/result?p=@flair/ssr) 😎 |
| [Theming](#theming-usage) | ✅ | ✅ |
| [Dynamic coloring](#dynamic-coloring) | ✅ | ✅ |
| Same lean API | 😎 | 😎 |
<!-- prettier-ignore-end -->

### How does this all work?

[See the architecture docs for more info.](./architecture.md)

### Enabling the experimental SSR mode (`@flair/ssr`)

> ⚠️ In order to get this to work, you need to be able to freely configure babel and webpack. This is currently _not_ possible with `create-react-app`.

### Configure babel

Create or modify your `.babelrc` configuration file at the root of your folder.

```js
{
  "presets": [
    // ...rest of your presets
  ],
  "plugins": [
    // ...rest of your plugins
    [
      "@flair/plugin",
      {
        // this is the theme file. refer to here:
        // https://github.com/ricokahler/flair#create-your-theme
        "themePath": "./src/styles/theme.js"
      }
    ]
  ]
}
```

> **Note:** You do _not_ need to change your imports. The babel plugin `@flair/plugin` will re-write your imports to use the `@flair/ssr` package

### Configure Webpack

In your webpack config, create a new rule for `.rss-css` files and include the `@flair/loader` in the chain.

```js
module.exports = {
  // ...
  module: {
    // ...
    rules: [
      // ...
      {
        test: /\.rss-css$/,
        use: [
          'style-loader', // you can use the mini-css-extract-plugin instead too
          {
            loader: 'css-loader',
            options: { importLoaders: 2 },
          },
          // flair loader must be last
          '@flair/loader',
        ],
        include: [
          require.resolve('@flair/loader/load.rss-css'),
          // ...
        ],
      },
    ],
  },
};
```

### Credits

Big thanks to [`@lepture`](https://twitter.com/lepture) for the name `flair` ❤️
