import React, { useContext, useEffect } from 'react';
import { act, create } from 'react-test-renderer';
import ColorContextProvider from './ColorContextProvider';
import ColorContext from './ColorContext';

it('wraps the components with a populated color context', () => {
  const effectHandler = jest.fn();

  function ExampleComponent() {
    const colorContext = useContext(ColorContext);

    useEffect(() => {
      effectHandler(colorContext);
    }, [colorContext]);

    return null;
  }

  act(() => {
    create(
      <ColorContextProvider color="red" surface="black">
        <ExampleComponent />
      </ColorContextProvider>,
    );
  });

  expect(effectHandler).toHaveBeenCalled();
  expect(effectHandler).toMatchInlineSnapshot(`
    [MockFunction] {
      "calls": Array [
        Array [
          Object {
            "color": "red",
            "surface": "black",
          },
        ],
      ],
      "results": Array [
        Object {
          "type": "return",
          "value": undefined,
        },
      ],
    }
  `);
});
