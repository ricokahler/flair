import { useContext } from 'react';
import ColorContext from './ColorContext';

function useColorContext() {
  const colorContext = useContext(ColorContext);

  if (!colorContext) {
    throw new Error(
      'Could not find color context. Ensure this component is wrapped in a ColorContextProvider.',
    );
  }

  return colorContext;
}

export default useColorContext;
