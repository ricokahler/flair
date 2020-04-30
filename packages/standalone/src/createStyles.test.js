import React, { useEffect, useState } from 'react';
import { act, create } from 'react-test-renderer';
import { ThemeProvider, ColorContextProvider } from '@react-style-system/core';
import { DeferredPromise } from '@react-style-system/common';
import createStyles from './createStyles';

const theme = { colors: { brand: '#00f' } };

let mockIndex = 0;

jest.mock('nanoid', () => ({
  nanoid: () => {
    const mockId = `id-${mockIndex}`;
    mockIndex += 1;
    return mockId;
  },
}));

const delay = () => new Promise((resolve) => setTimeout(resolve, 0));

it('returns colors, styles, and the root component', async () => {
  const stylesHandler = jest.fn();
  const createStylesHandler = jest.fn();
  const rootHandler = jest.fn();
  const done = new DeferredPromise();

  const useStyles = createStyles(({ color, theme, css }) => {
    createStylesHandler({ color, theme, css });

    return {
      root: 'root',
      title: 'title',
    };
  });

  function Component(props) {
    const { Root, styles } = useStyles(props);

    useEffect(() => {
      stylesHandler(styles);
      rootHandler(Root);
      done.resolve();
    }, [Root, styles]);

    return <Root>blah</Root>;
  }

  await act(async () => {
    create(
      <ThemeProvider theme={theme}>
        <ColorContextProvider color={theme.colors.brand} surface="#fff">
          <Component />
        </ColorContextProvider>
      </ThemeProvider>,
    );
    await done;
  });

  const styles = stylesHandler.mock.calls[0][0];
  const createStylesValues = createStylesHandler.mock.calls[0][0];
  const Root = rootHandler.mock.calls[0][0];

  expect(styles).toMatchInlineSnapshot(`
    Object {
      "cssVariableObject": Object {},
      "root": "rss_root_id-0_id-1",
      "title": "rss_title_id-0_id-1",
    }
  `);
  expect(createStylesValues).toMatchInlineSnapshot(`
    Object {
      "color": Object {
        "aa": "#00f",
        "aaa": "#00f",
        "decorative": "#00f",
        "original": "#00f",
        "readable": "#00f",
      },
      "css": [Function],
      "theme": Object {
        "colors": Object {
          "brand": "#00f",
        },
      },
    }
  `);
  expect(Root).toBeDefined();
});

it('composes the classnames', () => {
  const useStyles = createStyles(() => ({
    root: 'root-from-styles',
    title: 'title-from-styles',
  }));

  function Component(props) {
    const { Root, styles, title } = useStyles(props);

    return (
      <Root>
        <h1 className={styles.title}>{title}</h1>
      </Root>
    );
  }

  let result;

  act(() => {
    result = create(
      <ThemeProvider theme={theme}>
        <ColorContextProvider color={theme.colors.brand} surface="#fff">
          <Component
            className="root-from-class-name"
            style={{ border: '1px solid red' }}
            styles={{
              root: 'root-from-incoming-styles',
              title: 'title-from-incoming-styles',
            }}
            title="test title"
          />
        </ColorContextProvider>
      </ThemeProvider>,
    );
  });

  expect(result).toMatchInlineSnapshot(`
    <div
      className="rss_root_id-2_id-3 root-from-incoming-styles root-from-class-name"
      style={
        Object {
          "border": "1px solid red",
        }
      }
    >
      <h1
        className="rss_title_id-2_id-3 title-from-incoming-styles"
      >
        test title
      </h1>
    </div>
  `);
});

test("the root node doesn't remount when classnames changes", async () => {
  const done = new DeferredPromise();

  const useStyles = createStyles(() => ({
    root: 'style-root',
    title: 'style-title',
  }));

  const rerenderHandler = jest.fn();
  const rootClassHandler = jest.fn();

  function Component(props) {
    const { Root, styles } = useStyles(props);

    useEffect(() => {
      rerenderHandler();
    }, []);

    useEffect(() => {
      rootClassHandler(styles.root);
    }, [styles.root]);

    return <Root>test</Root>;
  }

  function Parent() {
    const [count, setCount] = useState(0);

    useEffect(() => {
      (async () => {
        for (let i = 0; i < 3; i += 1) {
          await delay();
          setCount((count) => count + 1);
        }
        done.resolve();
      })();
    }, []);

    return <Component styles={{ root: `count-${count}` }} />;
  }

  await act(async () => {
    create(
      <ThemeProvider theme={theme}>
        <ColorContextProvider color={theme.colors.brand} surface="#fff">
          <Parent />
        </ColorContextProvider>
      </ThemeProvider>,
    );
    await done;
  });

  expect(rerenderHandler).toHaveBeenCalledTimes(1);

  const classNamesOverTime = rootClassHandler.mock.calls.map((args) => args[0]);
  expect(classNamesOverTime).toMatchInlineSnapshot(`
    Array [
      "rss_root_id-4_id-5 count-0",
      "rss_root_id-4_id-5 count-1",
      "rss_root_id-4_id-5 count-2",
      "rss_root_id-4_id-5 count-3",
    ]
  `);
});

it('memoizes the Root component reference and the styles reference', async () => {
  const done = new DeferredPromise();

  const useStyles = createStyles(() => ({
    root: 'style-root',
    title: 'style-title',
  }));

  const rerenderHandler = jest.fn();
  const rootComponentHandler = jest.fn();
  const stylesHandler = jest.fn();

  function Component(props) {
    const { Root, styles } = useStyles(props);

    useEffect(() => {
      rerenderHandler();
    }, []);

    useEffect(() => {
      rootComponentHandler(Root);
    }, [Root]);

    useEffect(() => {
      stylesHandler(styles);
    }, [styles]);

    return <Root>test</Root>;
  }

  function Parent() {
    const [, setCount] = useState(0);

    useEffect(() => {
      (async () => {
        for (let i = 0; i < 3; i += 1) {
          await delay();
          setCount((count) => count + 1);
        }
        done.resolve();
      })();
    }, []);

    return (
      <Component
        style={{ border: '1px solid red' }}
        styles={{ root: 'same-instance' }}
      />
    );
  }

  await act(async () => {
    create(
      <ThemeProvider theme={theme}>
        <ColorContextProvider color={theme.colors.brand} surface="#fff">
          <Parent />
        </ColorContextProvider>
      </ThemeProvider>,
    );
    await done;
  });

  expect(rerenderHandler).toHaveBeenCalledTimes(1);
  expect(rootComponentHandler).toHaveBeenCalledTimes(1);
  expect(stylesHandler).toHaveBeenCalledTimes(1);
});

it('adds a style sheet to the DOM', async () => {
  const done = new DeferredPromise();

  const useStyles = createStyles(({ css }) => ({
    root: css`
      background-color: red;
    `,
  }));

  function Example(props) {
    const { Root, styles } = useStyles(props);

    useEffect(() => {
      done.resolve(styles);
    }, [styles]);

    return <Root>blah</Root>;
  }

  let styles;
  await act(async () => {
    create(
      <ThemeProvider theme={theme}>
        <ColorContextProvider color={theme.colors.brand} surface="#fff">
          <Example />
        </ColorContextProvider>
      </ThemeProvider>,
    );

    styles = await done;
  });

  expect(styles).toMatchInlineSnapshot(`
Object {
  "cssVariableObject": Object {},
  "root": "rss_root_id-8_id-9",
}
`);
  const styleEls = Array.from(document.querySelectorAll('style'));

  const lastStyleEl = styleEls[styleEls.length - 1];

  expect(lastStyleEl.innerHTML).toMatchInlineSnapshot(
    `".rss_root_id-8_id-9{background-color:red;}"`,
  );
});
