import React, { useMemo } from 'react';
import ColorContext from './ColorContext';

interface Props {
  color: string;
  surface: string;
  children: React.ReactNode;
}

function ColorContextProvider({ color, surface, children }: Props) {
  const contextValue = useMemo(() => ({ color, surface }), [color, surface]);
  return (
    <ColorContext.Provider value={contextValue}>
      {children}
    </ColorContext.Provider>
  );
}

export default ColorContextProvider;
