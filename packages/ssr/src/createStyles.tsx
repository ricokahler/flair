import React, { forwardRef, useMemo } from 'react';
import classNames from 'classnames';
import {
  ReactComponent,
  StyleProps,
  StyleFnArgs,
  GetComponentProps,
  UseStyles,
  css,
  useTheme,
  useColorContext,
  createReadablePalette,
} from '@react-style-system/core';

function hashStyleObj(
  styleObj: { [key: string]: string | undefined } | null | undefined,
) {
  if (!styleObj) return '';

  return Object.keys(styleObj)
    .map(key => `${key}_${styleObj[key]}`)
    .join('__|__');
}

function usePreserveReference<
  T extends { [key: string]: string | undefined } | null | undefined
>(styleObj: T): T {
  return useMemo(
    () => styleObj,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hashStyleObj(styleObj)],
  );
}

// preserve the object reference
const empty = {};

const identity = <T extends any>(t: T) => t;

function createStyles<Styles extends { [key: string]: string }, Theme = any>(
  stylesFn: (args: StyleFnArgs<Theme>) => Styles,
) {
  function useStyles<
    Props extends StyleProps<Styles>,
    ComponentType extends ReactComponent = 'div'
  >(
    props: Props = {} as any,
    component?: ComponentType,
  ): Omit<Props, 'surface' | 'color' | 'style' | 'styles' | 'className'> & {
    Root: React.ComponentType<GetComponentProps<ComponentType>>;
    styles: Styles & { cssVariableObject: { [key: string]: string } };
  } {
    const theme = useTheme<Theme>();
    const colorContext = useColorContext();
    const defaultColor = colorContext.color;
    const defaultSurfaceColor = colorContext.surface;
    const {
      color = defaultColor,
      surface = defaultSurfaceColor,
      className: incomingClassName,
      style: _incomingStyle,
      styles: _incomingStyles = empty as Styles,
      ...restOfProps
    } = props;

    const incomingStyle = usePreserveReference(_incomingStyle as any);
    const incomingStyles = usePreserveReference(_incomingStyles as any);

    // create a map of unprocessed styles
    const { cssVariableObject, classes, classNamePrefix } = useMemo(() => {
      const variableObject: any = stylesFn({
        css,
        color: createReadablePalette(color, surface),
        theme,
        surface,
        staticVar: identity,
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

      const mergedStyles = thisStyleKeys.reduce((merged, key) => {
        const thisStyle = thisStyles[key];
        const incomingStyle = incomingStyles[key];

        merged[key] = classNames(
          thisStyle,
          incomingStyle,
        ) as Styles[keyof Styles];

        return merged;
      }, {} as Styles);

      return { ...mergedStyles, cssVariableObject };
    }, [thisStyles, cssVariableObject, incomingStyles]);

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
    }, [
      mergedStyles.root,
      incomingClassName,
      incomingStyle,
      cssVariableObject,
    ]);

    return {
      Root,
      styles: mergedStyles,
      ...restOfProps,
    };
  }

  // This is a type-assertion so ensure that this type is compatible with the
  // `UseStyles` type. TODO: may want to find a better way to enforce this
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  useStyles as UseStyles<any, any>;

  return useStyles;
}

export default createStyles;
