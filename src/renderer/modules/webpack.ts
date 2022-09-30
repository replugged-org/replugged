export const filters = {
  byProps: () => {},
  byString: () => {}
};

export function getModule (filter: (module: any) => boolean) {}

export function getByProps (...props: string[]) {}

export function getByString (pattern: string) {}
