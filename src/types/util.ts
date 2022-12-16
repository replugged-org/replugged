export type Awaitable<T> = T | Promise<T>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunction = (...args: any[]) => unknown;
export type ObjectKey<O, T> = { [K in keyof O]: O[K] extends T ? K : never }[keyof O & string];
