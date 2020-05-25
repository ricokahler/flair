import { useContext } from 'react';
import ThemeContext from './ThemeContext';

function useTheme<T>(): T {
  return useContext(ThemeContext) as T;
}

export default useTheme;
