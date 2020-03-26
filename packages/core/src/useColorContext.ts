import { useContext } from 'react';
import invariant from 'invariant';
import ColorContext from './ColorContext';

function useColorContext() {
  const colorContext = useContext(ColorContext);
  invariant(
    colorContext !== null,
    'Could not find color context. Ensure this component is wrapped in a ColorContextProvider.',
  );
  return colorContext;
}

export default useColorContext;
