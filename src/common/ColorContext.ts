import { createContext } from 'react';
import { ColorContextValue } from 'src/types';

export default createContext<ColorContextValue | null>(null);
