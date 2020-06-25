### Architecture

This repo is structured as a mono-repo solely to split up dependencies. This ensures that when a package is installed, only the necessary dependencies are brought in.

There are a total of 8 packages in this repo:

<!-- prettier-ignore-start -->
| Package | Description |
|-|-|
| `@flair/babel-plugin-plugin` | The babel plugin that enables SSR mode |
| `@flair/collect` | A function that extracts/collects the CSS from the JS |
| `@flair/common` | A common set of zero-dependency helpers (mostly collection related) |
| `@flair/core` | The common set of functions needed in both the SSR and standalone versions used in the browser | 
| `@flair/loader` | A simple webpack loader that feeds CSS to other CSS loaders in your webpack loader chain |
| `@flair/ssr` | The browser implementation of flair that requires the babel plugin |
| `@flair/standalone` | The browser implementation of flair that works with no plugins or loaders required |
| `flair` | The user-facing top-level package. It simply re-exports the standalone implementation but also serves as a placeholder package for the SSR version |

> **Note:** Even though there are many packages in this repo, you should only ever need to install the top-level `flair` package.

<!-- prettier-ignore-end -->

### How does the standalone version work?

The unscoped, top-level package `flair` simply re-exports the entire `@flair/standalone` package.

The standalone version includes [stylis](https://github.com/thysultan/stylis.js) (which powers both `styled-components` and `emotion`) as a browser dependency.

During render, the standalone version:

1. pulls your styles from the CSS template literals,
2. processes via stylis it in the browser, and
3. creates and mounts a stylesheet

This all occurs in a React layout effect on first render.

The standalone version is nice because it doesn't require any compilers to work so it drops in most environments no problem.

[See the implementation of the standalone version here.](https://github.com/ricokahler/flair/blob/master/packages/standalone/src/createStyles.tsx)

### How does the SSR version work?

The SSR version is bit more involved with a bit more moving parts.

1. The babel plugin (`@flair/babel-plugin-plugin`) does two things:
   1. it transforms any imports of `flair` to `@flair/ssr` to use the SSR entry point instead of the top-level package.
   2. it calls collect from `@flair/collect` to extract the CSS from the JS. When the CSS is extracted, it creates an import that can be picked up by the loader.
   3. it removes any left over CSS that would be extracted but leaves any JavaScript dynamic expressions (to populate CSS variables)
2. In order for the collection above to work (`@flair/collect`), it:
   1. Transform the component code (again) so that the CSS can be extracted and executed in node
   2. Javascript expressions in the template literals are converted to CSS variables
   3. The transformed code is executed in node and the static CSS is returned
3. After the babel plugin makes a pass, it can then be picked up by the loader (`@flair/loader`). The plugin puts the CSS in the query string of a resource (e.g. `import '@flair/loader/load.rss-css?css=<THE_CSS>`) so the job of the loader is to grab the CSS from the query string and forward it to the next CSS loader.

