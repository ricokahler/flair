import { useContext } from 'react';
import invariant from 'invariant';
import ThemeContext from './ThemeContext';

function useTheme<T>(): T {
  const theme = useContext(ThemeContext) as T | null;
  invariant(
    theme !== null,
    'Could not find theme. Ensure this component is wrapped in a ThemeProvider',
  );
  return theme;
}

export default useTheme;
