// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunction = (...args: any[]) => unknown;
export type UnknownFunction = (...args: unknown[]) => unknown;
export type ObjectKey<O, T> = { [K in keyof O]: O[K] extends T ? K : never }[keyof O & string];

export type ReactComponent<P> = React.ComponentType<
  React.PropsWithChildren<P & Record<string, unknown>>
>;
