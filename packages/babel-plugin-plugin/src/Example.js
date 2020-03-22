import React from 'react';
import { createStyles } from 'react-style-system';
import getRed from './submodule';

const useStyles = createStyles(({ css, theme }) => ({
  root: css`
    margin: ${theme.space(1)} ${theme.space(2)};
    height: ${theme.block(5)};
    display: flex;
    flex-direction: column;
    transition: background-color ${theme.durations.standard},
      border ${theme.durations.standard};
    overflow: hidden;
    color: ${getRed()};
  `,
  title: css`
    ${theme.fonts.h4};
    flex: 0 0 auto;
    /* margin-bottom: calc(50vh - ${theme.space(2)}); */
    color: ${theme.colors.brand};

    ${theme.down(theme.tablet)} {
      ${theme.fonts.h5};
    }
  `,
  body: css`
    border-bottom: 1px solid ${theme.colors.danger};
    flex: 1 1 auto;
  `,
}));

function Card(props) {
  const { Root, styles, title, description } = useStyles(props);

  return (
    <Root>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.body}>{description}</p>
    </Root>
  );
}

export default Card;
