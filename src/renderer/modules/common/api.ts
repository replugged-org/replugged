import { waitForProps } from "../webpack";

export type API = Record<
  "get" | "patch" | "post" | "put" | "delete",
  <T = Record<string, unknown>>(
    req:
      | string
      | {
          url: string;
          query?: Record<string, string>;
          body?: Record<string, unknown>;
          headers?: Record<string, string>;
        },
  ) => Promise<{
    body: T;
    status: number;
    headers: Record<string, string>;
    ok: boolean;
    text: string;
  }>
> & {
  getAPIBaseURL: (version?: boolean) => string;
};

export default await waitForProps<API>("getAPIBaseURL", "get", "patch", "post", "put", "delete");
