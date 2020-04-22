import React from 'react';
import logo from './logo.svg';
import './App.css';

import { createStyles } from 'react-style-system';

const useStyles = createStyles(({ css }) => ({
  root: css`
    background-color: midnightblue;
  `,
}));

function App(props) {
  const { Root } = useStyles(props);
  return (
    <Root className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </Root>
  );
}

export default App;
