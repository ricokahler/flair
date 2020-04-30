import React, { useContext, useEffect } from 'react';
import { act, create } from 'react-test-renderer';
import ThemeProvider from './ThemeProvider';
import ThemeContext from './ThemeContext';

it('wraps the components with a populated color context', () => {
  const effectHandler = jest.fn();
  const exampleTheme = {};

  function ExampleComponent() {
    const theme = useContext(ThemeContext);

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
  const firstCall = effectHandler.mock.calls[0][0];

  expect(firstCall).toBe(exampleTheme);
});
