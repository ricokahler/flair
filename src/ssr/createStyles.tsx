import React, { forwardRef, useMemo } from 'react';
import classNames from 'classnames';
import { ReadableColorPalette, ReactComponent, StyleProps } from 'src/types';
import useTheme from 'src/common/useTheme';
import createReadablePalette from 'src/common/createReadablePalette';
import useColorContext from 'src/common/useColorContext';
// TODO: move to common
import css from 'src/standalone/css';

type GetComponentProps<
  ComponentType extends ReactComponent
> = ComponentType extends React.ComponentType<infer U>
  ? U
  : ComponentType extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[ComponentType]
  : any;

function hashStyleObj(styleObj: { [key: string]: string | undefined }) {
  return Object.keys(styleObj)
    .map(key => `${key}_${styleObj[key]}`)
    .join('__|__');
}

// preserve the object reference
const empty = {};

type StyleFnArgs = {
  css: (
    strings: TemplateStringsArray,
    ...values: (string | number)[]
  ) => string;
  color: ReadableColorPalette;
  theme: any;
  surface: string;
};

function createStyles<Styles extends { [key: string]: string }>(
  stylesFn: (args: StyleFnArgs) => Styles,
) {
  function useStyles<
    Props extends StyleProps<Styles>,
    ComponentType extends ReactComponent = 'div'
  >(
    props: Props = {} as any,
    component?: ComponentType,
  ): Omit<Props, 'surface' | 'color' | 'style' | 'styles' | 'className'> & {
    Root: React.ComponentType<GetComponentProps<ComponentType>>;
    styles: Styles;
  } {
    const theme = useTheme();
    const colorContext = useColorContext();
    const defaultColor = colorContext.color;
    const defaultSurfaceColor = colorContext.surface;
    const {
      color = defaultColor,
      surface = defaultSurfaceColor,
      style: incomingStyle,
      className: incomingClassName,
      styles: incomingStyles = empty as Styles,
      ...restOfProps
    } = props;

    const incomingStyleHash = hashStyleObj(incomingStyles);

    // create a map of unprocessed styles
    const { cssVariableObject, classes, classNamePrefix } = useMemo(() => {
      const variableObject: any = stylesFn({
        css,
        color: createReadablePalette(color, surface),
        theme,
        surface,
      });

      const { classNamePrefix, ...classNamesVariableValues } = variableObject;

      const cssVariableObject = Object.entries(classNamesVariableValues)
        .map(([className, values]) =>
          (values as string[]).map((value, i) => ({
            key: `--${classNamePrefix}-${className}-${i}`,
            value,
          })),
        )
        .flat()
        .reduce((acc, { key, value }) => {
          acc[key] = value;
          return acc;
        }, {} as { [key: string]: string });

      return {
        cssVariableObject,
        classes: Object.keys(classNamesVariableValues),
        classNamePrefix,
      };
    }, [color, surface, theme]);

    // calculate the class names
    const thisStyles = useMemo(() => {
      return classes
        .map(key => [key, `${classNamePrefix}-${key}`])
        .reduce((acc, [key, className]) => {
          acc[key as keyof Styles] = className as Styles[keyof Styles];
          return acc;
        }, {} as Styles);
    }, [classNamePrefix, classes]);

    const mergedStyles = useMemo(() => {
      const thisStyleKeys = Object.keys(thisStyles) as Array<keyof Styles>;

      return thisStyleKeys.reduce((merged, key) => {
        const thisStyle = thisStyles[key];
        const incomingStyle = incomingStyles[key];

        merged[key] = classNames(
          thisStyle,
          incomingStyle,
        ) as Styles[keyof Styles];

        return merged;
      }, {} as Styles);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [thisStyles, incomingStyleHash]);

    const Component = (component || 'div') as React.ComponentType<any>;

    const Root = useMemo(() => {
      return forwardRef((rootProps: StyleProps<Styles>, ref: any) => {
        const { className: rootClassName, style: rootStyles } = rootProps;

        return (
          <Component
            {...rootProps}
            ref={ref}
            className={classNames(
              mergedStyles.root,
              rootClassName,
              incomingClassName,
            )}
            style={{
              ...rootStyles,
              ...incomingStyle,
              ...cssVariableObject,
            }}
          />
        );
      }) as React.ComponentType<GetComponentProps<ComponentType>>;
      // TODO: audit this 👇
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [incomingClassName, incomingStyleHash, mergedStyles.root, Component]);

    return {
      Root,
      styles: mergedStyles,
      ...restOfProps,
    };
  }

  return useStyles;
}

export default createStyles;
