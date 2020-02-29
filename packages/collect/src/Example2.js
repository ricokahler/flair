import React from 'react';
import { createStyles } from 'react-style-system';

const useStyles = createStyles(({ css }) => ({
  root: css``,
}));

function Example2(props) {
  const { Root } = useStyles(props);

  return <Root>Text</Root>;
}

export default Example2;
