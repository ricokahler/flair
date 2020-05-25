import React, { useEffect, useContext } from 'react';
import { act, create } from 'react-test-renderer';
import ThemeContext from './ThemeContext';

it('is a react context value with an initial value of empty obj', () => {
  const effectHandler = jest.fn();

  function ExampleComponent() {
    const theme = useContext(ThemeContext);
    useEffect(() => {
      effectHandler(theme);
    }, [theme]);
    return null;
  }

  act(() => {
    create(<ExampleComponent />);
  });

  expect(effectHandler).toHaveBeenCalled();
  const result = effectHandler.mock.calls[0][0];

  expect(result).toEqual({});
});
