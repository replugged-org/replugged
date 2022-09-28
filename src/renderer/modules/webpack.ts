export const filters = {
  byProps: () => {},
  byString: () => {},
};

export function getModule(
  filter: string[] | ((defaultExport: any) => boolean)
) {}

export function getByProps(...props: string[]) {}

export function getByString(pattern: string) {}
