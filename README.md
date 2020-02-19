# React Style System

> a carefully thought-out system system for React components

## Why another CSS-in-JS solution?

<details>
  <summary>Why another CSS-in-JS solution (long)?</summary>
  
  ### 1. Component-centric semantics for styles

If you've ever used material-ui or JSS, then you're familiar with this concept. In material-ui, you define styles using with `withStyles` or `makeStyles`. You pass into those function an object with style classes and it returns something that lets you inject styles into a component.

e.g.

```js
// Component.js
import React from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    /* styles go here */
  },
  title: {
    /* styles go here */
  },
}));

function Component(props) {
  const classes = useStyles(props);
  // classes.root…
  // classes.title…
}

export default Component;
```

What I like about this pattern is that it's clear that the styles you're writing are for a component and you can even have the integrate some styling APIs right into the component's API (i.e. its props).

For example, in material-ui, a parent component can override `title` styles like so:

```js
// Parent.js
import React from 'react';
import { makeStyles } from '@material-ui/core';
import Component from './Component';

const useStyles = makeStyles(theme => ({
  root: {/* ... */},
  modifedTitle: {/* ... */},
});

function Parent(props) {
  const classes = useStyles(props);

  return (
    <>
      <Component classes={{ title: classes.modifiedTitle }} />
    </>
  );
}
```

In contrast, emotion and styled-components do not share these component rooted semantics. With emotion/styled-components, you're always writing styles for an individual element, not a component.

```js
import React from 'react';
import styled from 'styled-component';

// no component semantics
const Title = styled.div`
  font-weight: bold;
`;

// no built-in ability to override the `Title` class
function Component() {
  return (
    <>
      {/* ... */}
      <Title />
      {/* ... */}
    </>
  );
}
```

### 2. Embrace HTML semantics via `className`s

Another issue I have with styled-components like syntax (e.g. `styled.div`) is that it abstracts away HTML semantics and makes it uncomfortable to use class names. Going back to material-ui again, since their styling solution embraces class names and HTML semantics, it's easy to use tools like [`classnames`](https://github.com/JedWatson/classnames) to conditionally apply CSS classnames.

```js
import React from 'react';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    /* ... */
  },
  button: {
    /* ... */
  },
  title: {
    /* ... */
  },
  highlighted: {
    /* ... */
  },
}));

function Component(props) {
  const classes = useStyles(props);
  const [on, setOn] = useState(false);

  return (
    <>
      <button className={classes.button} onClick={() => setOn(!on)}>
        toggle color
      </button>
      <h1
        className={classNames(classes.title, {
          [classes.highlighted]: on,
        })}
      >
        color
      </h1>
    </>
  );
}
```

It's possible to do the above with styled-components syntax however it requires passing props into the styled component. I find this uncomfortable because it adds to the API footprint of the styled component and further takes away from the raw HTML element.

```js
import React from 'react';
import styled from 'styled-components';

const Root = styled.div`/* ... */`;
// note: if you were using typescript, you'd have to write different props for this one now
const Title = styled.h1`
  color: ${props => props.highlighted ? 'red' : 'black'}
`;

function Component() {
  const [on, setOn] = useState(false);

  return (
    <Root>
      <button onClick={() => setOn(!on)}>toggle color</button>
      <Title highlighted={on}>
    </Root>
  );
}
```

My issue with the above is that is it becomes easy to forget that the `Title` component is an HTML `h1` tag (e.g., it's under a different name and the props are different now).

When you forget that HTML is HTML, you forget to do things like add `aria-label`s, linters have a harder time giving you HTML suggestions, concepts like class names become foreign, and you almost grow resentment towards using a "raw" HTML elements. It's like the raw `button` element is ugly because it's not uppercase 🤷‍♀️

Anyway, embracing HTML makes it easier to embrace HTML semantic elements which is better for a11y and SEO.

### 3. Write actual CSS

This is where material-ui's styling solution falls short. I think it's better to write actual CSS (vs the JS object styling syntax) because:

1. It allows for better DX by being able to copy and paste CSS examples directly into code.
2. It allows for editors to "switch modes". Specifically, another language service could be booted up inside of `css` tags allowing for autocomplete without using the TypeScript language service. There are many plugins/extensions for many different editors that do this.

### 4. The ability to be define the color of a component dynamically, including derived states, in the context of a component

This one is is a bit specific but important regarding the color system of Hacker UI so bare with me hear for a bit…

If you take look at the styles for Material UI, you can see that they have styles for both the "primary" and "secondary" color form their theme, and besides the `primary` `secondary`, these styles are the same.

```js
   /* Styles applied to the root element if `variant="contained"` and `color="primary"`. */
  containedPrimary: {
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
      // Reset on touch devices, it doesn't add specificity
      '@media (hover: none)': {
        backgroundColor: theme.palette.primary.main,
      },
    },
  },
  /* Styles applied to the root element if `variant="contained"` and `color="secondary"`. */
  containedSecondary: {
    color: theme.palette.secondary.contrastText,
    backgroundColor: theme.palette.secondary.main,
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
      // Reset on touch devices, it doesn't add specificity
      '@media (hover: none)': {
        backgroundColor: theme.palette.secondary.main,
      },
    },
  },
```

[source](https://github.com/mui-org/material-ui/blob/f2d74e9144ffec1ba6a098528573c7dfb3957b48/packages/material-ui/src/Button/Button.js#L137-L160)

So here's the goal: instead of having two or three related classes _just_ for colors, let's define a way to dynamically define one style class that works for all possible colors, and, let the user pass in the color via a prop.

The end goal is to be able to write styles like this:

```js
// Button.js
import React from 'react';
import { createStyles } from 'hacker-ui';
import { readableColor } from 'polished';

const useStyles = createStyles(color => ({
  button: css`
    background-color: ${color},
    color: ${readableColor(color)};
  `,
}));

function Button(props) {
  // ...
}
```

```js
// Parent.js
import Button from './Button';

function Parent() {
  return (
    <>
      {/* allow the user to pass in any color, the component styles will handle it. */}
      <Button color="red" />
      <Button color="blue" />
    </>
  );
}
```

### 5. The ability to ship mostly static CSS (for better SSR/SEO/performance)

If you're not familiar, linaria is a zero runtime CSS-in-JS solution that solved a lot of performance issues because it extracts all the styles you write with it to static CSS.

> Note: by ability tho ship static CSS, I mean that there is little to no javascript code related to styling left in the final bundle. This is different than SSR support.
>
> For example, Material UI/JSS supports server-side rendered CSS but the resulting JavaScript still includes the code to create the styles. Because the JS still includes the styling code, it will slow down [TTI](https://developers.google.com/web/tools/lighthouse/audits/time-to-interactive).
</details>

## Feature comparison

|                              | Material UI/JSS | styled-components | emotion | linaria | react-style-system |
|------------------------------|-----------------|-------------------|---------|---------|--------------------|
| Component-centric semantics  |  ✅              | 🔴                 | 🔴       | 🔴       | ✅                   |
| Embraces HTML                |  ✅              | 🔴                 | ✅       | 🔴       | ✅                   |
| Actual CSS                   |  🔴              | ✅                 | 🔴       | 🔴       | ✅                   |
| Dynamic component coloring   |  🔴              | 🔴                 | 🔴       | 🔴       | ✅                   |
| Ship (near) zero-runtime CSS |  🔴              | 🔴                 | 🔴       | ✅       | ✅                   |

## Usage

