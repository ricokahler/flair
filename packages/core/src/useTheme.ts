import { useContext } from 'react';
import ThemeContext from './ThemeContext';

function useTheme<T>(): T {
  const theme = useContext(ThemeContext) as T | null;

  if (!theme) {
    throw new Error(
      'Could not find theme. Ensure this component is wrapped in a ThemeProvider',
    );
  }

  return theme;
}

export default useTheme;
