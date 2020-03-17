import React, { useEffect } from 'react';
import { create, act } from 'react-test-renderer';
import { ThemeProvider, ColorContextProvider } from '@react-style-system/core';
import createStyles from './createStyles';

it('takes a styles function and returns a hook', async () => {
  const useStyles = createStyles(({ css }) => ({
    root: ['red'],
    classNamePrefix: 'Example-0000',
  }));

  const stylesHandler = jest.fn();

  let resolve;
  const done = new Promise(thisResolve => (resolve = thisResolve));

  function Example(props) {
    const { Root, styles } = useStyles(props);

    useEffect(() => {
      stylesHandler(styles);
      resolve();
    }, [styles]);

    return <Root>hello world</Root>;
  }

  let result;

  await act(async () => {
    result = create(
      <ThemeProvider theme={{}}>
        <ColorContextProvider color="#000" surface="#fff">
          <Example />
        </ColorContextProvider>
      </ThemeProvider>,
    );
    await done;
  });

  expect(result).toMatchInlineSnapshot(`
    <div
      className="Example-0000-root"
      style={
        Object {
          "--Example-0000-root-0": "red",
        }
      }
    >
      hello world
    </div>
  `);

  expect(stylesHandler.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        Object {
          "cssVariableObject": Object {
            "--Example-0000-root-0": "red",
          },
          "root": "Example-0000-root",
        },
      ],
    ]
  `);
});

it.todo("doesn't have re-rendering issues");
test.todo('Root component composition (styles, classNames, props, ref)');
