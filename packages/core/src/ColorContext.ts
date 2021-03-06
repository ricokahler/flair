import { createContext } from 'react';
import { ColorContextValue } from './types';

export default createContext<ColorContextValue>({
  color: 'black',
  surface: 'white',
});
