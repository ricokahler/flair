import React, { forwardRef, useMemo, useLayoutEffect } from 'react';
import classNames from 'classnames';
import nanoId from 'nanoid';
import stylis from 'stylis';
import {
  ReactComponent,
  StyleProps,
  StyleFnArgs,
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

function hashStyleObj(styleObj: { [key: string]: string | undefined }) {
  return Object.keys(styleObj)
    .map(key => `${key}_${styleObj[key]}`)
    .join('__|__');
}

// preserve the object reference
const empty = {};

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
    styles: Styles;
  } {
    const theme = useTheme<Theme>();
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

    const thing = `
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    
    `

    console.log(thing)

    // create a map of unprocessed styles
    const unprocessedStyles = useMemo(() => {
      return stylesFn({
        css,
        color: createReadablePalette(color, surface),
        theme,
        surface,
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
            }}
          />
        );
      }) as React.ComponentType<GetComponentProps<ComponentType>>;
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