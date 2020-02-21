import { createStyles } from 'react-style-system';
import { darken, readableColor } from 'polished';

const useStyles = createStyles(({ css, theme }) => ({
  root: css`
    color: ${readableColor(theme.colors.brand)};
    background-color: ${theme.colors.brand};
  `,
  title: css`
    width: 50%;

    color: ${darken(0.1, theme.colors.brand)};

    ${theme.breakpoints.down(theme.breakpoints.mobile)} {
      width: 100%;
    }
  `,
}));

function MyComponent(props) {
  const { Root, styles, title } = useStyles(props);

  return (
    <Root>
      <h1 className={styles.title}>{title}</h1>
    </Root>
  );
}

export default MyComponent;
