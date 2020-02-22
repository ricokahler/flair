import React from 'react';
import { readableColor } from 'polished';
import { createStyles } from 'hacker-ui';

const useStyles = createStyles(({ css, theme }) => ({
  root: css`
    background-color: ${theme.colors.brand};
    color: ${readableColor(theme.colors.brand)};
  `,
  thing: css`
    color: ${readableColor(theme.colors.brand)};
    font-weight: bold;
  `,
}));

function Button(props) {
  const { Root, styles, thing } = useStyles(props, 'button');

  return (
    <Root>
      <span className={styles.thing}>{thing}</span>
    </Root>
  );
}

export default Button;
