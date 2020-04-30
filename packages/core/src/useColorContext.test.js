import React, { Component, useContext, useEffect } from 'react';
import { act, create } from 'react-test-renderer';
import ColorContextProvider from './ColorContextProvider';
import useColorContext from './useColorContext';

beforeEach(() => {
  jest.spyOn(console, 'error');
  global.console.error.mockImplementation(() => {});
});

afterEach(() => {
  global.console.error.mockRestore();
});

it('throws if there is no wrapping color context', () => {
  const errorHandler = jest.fn();

  class ErrorBoundary extends Component {
    componentDidCatch(e) {
      errorHandler(e);
    }
    render() {
      return this.props.children;
    }
  }

  function ExampleComponent() {
    useColorContext();
    return null;
  }

  act(() => {
    create(
      <ErrorBoundary>
        <ExampleComponent />
      </ErrorBoundary>,
    );
  });

  expect(errorHandler).toHaveBeenCalled();
  const first = errorHandler.mock.calls[0][0];
  expect(first.message).toMatchInlineSnapshot(
    `"Could not find color context. Ensure this component is wrapped in a ColorContextProvider."`,
  );
});

it('returns a the current context color wrapped in `createReadablePalette` with the surface color', () => {
  const effectHandler = jest.fn();

  function ExampleComponent() {
    const colorContext = useColorContext();
    useEffect(() => {
      effectHandler(colorContext);
    }, [colorContext]);

    return null;
  }

  act(() => {
    create(
      <ColorContextProvider color="red" surface="white">
        <ExampleComponent />
      </ColorContextProvider>,
    );
  });

  expect(effectHandler.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        Object {
          "color": Object {
            "aa": "#000",
            "aaa": "#000",
            "decorative": "red",
            "original": "red",
            "readable": "red",
          },
          "surface": "white",
        },
      ],
    ]
  `);
});

it('accepts incoming props so that the color context can prefer to use the values from props', () => {
  const effectHandler = jest.fn();

  function ExampleComponent(props) {
    const colorContext = useColorContext(props);

    useEffect(() => {
      effectHandler(colorContext);
    }, [colorContext]);

    return null;
  }

  act(() => {
    create(
      <ColorContextProvider color="red" surface="black">
        <ExampleComponent color="blue" />
      </ColorContextProvider>,
    );
  });

  expect(effectHandler.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        Object {
          "color": Object {
            "aa": "#fff",
            "aaa": "#fff",
            "decorative": "blue",
            "original": "blue",
            "readable": "#fff",
          },
          "surface": "black",
        },
      ],
    ]
  `);
});
