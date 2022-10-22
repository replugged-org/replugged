export type Awaitable<T> = T | Promise<T>;
export type AnyFunction = (...args: unknown[]) => unknown;
export type ObjectKey<O, T> = { [K in keyof O]: O[K] extends T ? K : never }[keyof O & string];
