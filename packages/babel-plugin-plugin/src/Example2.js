import React from 'react';
import { createStyles, Button } from 'hacker-ui';

const useStyles = createStyles(({ css, theme }) => ({
  root: css`
    background-color: ${theme.colors.band};
  `,
}));

function Example2(props) {
  const { Root } = useStyles(props);

  return (
    <Root>
      <Button>Example</Button>
    </Root>
  );
}

export default Example2;
