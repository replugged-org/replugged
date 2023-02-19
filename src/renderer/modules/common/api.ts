import { filters, getExportsForProps, waitForModule } from "../webpack";

export type API = Record<
  "get" | "patch" | "post" | "put" | "delete",
  <T = Record<string, unknown>>(req: {
    url: string;
    query?: Record<string, string>;
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
  }) => Promise<{
    body: T;
    status: number;
    headers: Record<string, string>;
    ok: boolean;
    text: string;
  }>
> & {
  getAPIBaseURL: () => string;
};

const props = ["getAPIBaseURL", "get", "patch", "post", "put", "delete"];

export default (await waitForModule(filters.byProps(...props)).then((mod) =>
  getExportsForProps(mod, props),
)) as API;
