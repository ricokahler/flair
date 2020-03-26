import React from 'react';
import ThemeContext from './ThemeContext';

interface Props {
  theme: unknown;
  children: React.ReactNode;
}

function ThemeProvider({ theme, children }: Props) {
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export default ThemeProvider;
