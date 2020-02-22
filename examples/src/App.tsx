import React from 'react';
import { createStyles, PropsFromStyles } from 'react-style-system';
import { readableColor } from 'polished';

const useStyles = createStyles(({ css, theme }) => ({
  root: css`
    background-color: ${theme.colors.brand};
    color: ${readableColor(theme.colors.brand)};
  `,
}));

interface Props extends PropsFromStyles<typeof useStyles> {}

function App(props: Props) {
  const { Root } = useStyles(props);
  return <Root>this is the root</Root>;
}

export default App;
