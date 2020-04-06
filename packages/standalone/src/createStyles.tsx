import React, { forwardRef, useMemo, useLayoutEffect } from 'react';
import classNames from 'classnames';
import nanoId from 'nanoid';
import stylis from 'stylis';
import {
  ReactComponent,
  StyleProps,
  StyleFnArgs,
  UseStyles,
  css,
  useTheme,
  useColorContext,
  createReadablePalette,
} from '@react-style-system/core';
import tryGetCurrentFilename from './tryGetCurrentFilename';

type GetComponentProps<
  ComponentType extends ReactComponent
> = ComponentType extends React.ComponentType<infer U>
  ? U
  : ComponentType extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[ComponentType]
  : any;

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
  const sheetId = nanoId();
  const fileName = tryGetCurrentFilename();

  // NOTE: this is, in-fact, a side effect
  // TODO: add docs here
  const sheetEl = document.createElement('style');
  sheetEl.dataset.reactStyleSystem = 'true';
  sheetEl.id = sheetId;
  document.head.appendChild(sheetEl);

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
    const { color, surface } = useColorContext(props);

    const {
      color: _color,
      surface: _surface,
      style: _incomingStyle,
      className: incomingClassName,
      styles: _incomingStyles = empty as Styles,
      ...restOfProps
    } = props;

    const incomingStyle = usePreserveReference(_incomingStyle as any);
    const incomingStyles = usePreserveReference(_incomingStyles as any);

    // create a map of unprocessed styles
    const unprocessedStyles = useMemo(() => {
      return stylesFn({
        css,
        color,
        theme,
        surface,
        staticVar: identity,
      });
    }, [color, surface, theme]);

    const styleId = useMemo(nanoId, [unprocessedStyles]);

    // calculate the class names
    const thisStyles = useMemo(() => {
      return Object.keys(unprocessedStyles)
        .map(key => [
          key,
          // the replace is ensure the class name only uses css safe characters
          `${fileName || 'rss'}_${key}_${sheetId}_${styleId}`.replace(
            /[^a-z0-9-_]/gi,
            '',
          ),
        ])
        .reduce((acc, [key, className]) => {
          acc[key as keyof Styles] = className as Styles[keyof Styles];
          return acc;
        }, {} as Styles);
    }, [styleId, unprocessedStyles]);

    // mount the styles to the dom
    useLayoutEffect(() => {
      const keys = Object.keys(thisStyles);

      const processedSheet = keys
        .map(key => {
          const className = thisStyles[key];
          const unprocessedStyle = unprocessedStyles[key];

          const processedStyle: string = stylis(
            `.${className}`,
            unprocessedStyle,
          );

          return processedStyle;
        })
        .join('\n\n');

      sheetEl.innerHTML += processedSheet;
    }, [thisStyles, unprocessedStyles]);

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

      return { ...mergedStyles, cssVariableObject: {} as any };
    }, [incomingStyles, thisStyles]);

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
            }}
          />
        );
      }) as React.ComponentType<GetComponentProps<ComponentType>>;
    }, [mergedStyles.root, incomingClassName, incomingStyle]);

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
