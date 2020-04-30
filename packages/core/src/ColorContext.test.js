import React, { useEffect, useContext } from 'react';
import { act, create } from 'react-test-renderer';
import ColorContext from './ColorContext';

it('is a react context value with an initial value of null', () => {
  const effectHandler = jest.fn();

  function ExampleComponent() {
    const colorContext = useContext(ColorContext);
    useEffect(() => {
      effectHandler(colorContext);
    }, [colorContext]);
    return null;
  }

  act(() => {
    create(<ExampleComponent />);
  });

  expect(effectHandler).toHaveBeenCalled();
  const result = effectHandler.mock.calls[0][0];

  expect(result).toBe(null);
});
