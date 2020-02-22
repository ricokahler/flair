import React from 'react';
import { render } from 'react-dom';
import { ThemeProvider, ColorContextProvider } from 'react-style-system';
import App from './App';
import exampleTheme from './exampleTheme';

const container = document.querySelector('#root');
render(
  <ThemeProvider theme={exampleTheme}>
    <ColorContextProvider color={exampleTheme.colors.brand} surface="#fff">
      <App />
    </ColorContextProvider>
  </ThemeProvider>,
  container,
);
