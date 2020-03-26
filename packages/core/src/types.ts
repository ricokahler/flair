export interface ReadableColorPalette {
  original: string;
  decorative: string;
  readable: string;
  aa: string;
  aaa: string;
}

export type PropsOf<T> = T extends React.ComponentType<infer U> ? U : never;

export type ReactComponent =
  | React.ComponentType<any>
  | keyof JSX.IntrinsicElements
  | string;

type GetStyleObj<UseStylesFn> = UseStylesFn extends (props: {
  styles: Partial<infer U>;
}) => any
  ? U
  : never;

export interface PropsFromStyles<UseStylesFn> {
  surface?: string;
  color?: string;
  style?: React.CSSProperties;
  styles?: Partial<GetStyleObj<UseStylesFn>>;
  className?: string;
}

export interface StyleProps<StylesObj> {
  surface?: string;
  color?: string;
  style?: React.CSSProperties;
  styles?: Partial<StylesObj>;
  className?: string;
}

export type OmitStyleProps<T> = Omit<T, keyof StyleProps<any>>;
export type PropsFromComponent<
  T extends React.ComponentType<any>
> = OmitStyleProps<PropsOf<T>>;

export interface ColorContextValue {
  color: string;
  surface: string;
}

export type StyleFnArgs<Theme = any> = {
  css: (
    strings: TemplateStringsArray,
    ...values: (string | number)[]
  ) => string;
  color: ReadableColorPalette;
  theme: Theme;
  surface: string;
  staticVar: (value: string) => string;
};

export type GetComponentProps<
  ComponentType extends ReactComponent
> = ComponentType extends React.ComponentType<infer U>
  ? U
  : ComponentType extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[ComponentType]
  : any;

export type UseStyles<T, ComponentType extends ReactComponent = 'div'> = <
  Props extends StyleProps<T>
>(
  props: Props,
  component?: ComponentType,
) => {
  Root: React.ComponentType<GetComponentProps<ComponentType>>;
  styles: { [P in keyof T]: string } & {
    cssVariableObject: { [key: string]: string };
  };
} & Omit<Props, keyof StyleProps<any>>;

export type StylesObj = { [key: string]: string };
