import React, { Component, useEffect } from 'react';
import { act, create } from 'react-test-renderer';
import ThemeProvider from './ThemeProvider';
import useTheme from './useTheme';

beforeEach(() => {
  jest.spyOn(console, 'error');
  global.console.error.mockImplementation(() => {});
});

afterEach(() => {
  global.console.error.mockRestore();
});

it('throws if there is no theme', () => {
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
    useTheme();
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
  const error = errorHandler.mock.calls[0][0];

  expect(error.message).toMatchInlineSnapshot(
    `"Could not find theme. Ensure this component is wrapped in a ThemeProvider"`,
  );
});

it('returns the theme from context', () => {
  const effectHandler = jest.fn();
  const exampleTheme = {};

  function ExampleComponent() {
    const theme = useTheme();

    useEffect(() => {
      effectHandler(theme);
    }, [theme]);

    return null;
  }

  act(() => {
    create(
      <ThemeProvider theme={exampleTheme}>
        <ExampleComponent />
      </ThemeProvider>,
    );
  });

  expect(effectHandler).toHaveBeenCalled();
  const first = effectHandler.mock.calls[0][0];

  expect(first).toBe(exampleTheme);
});
