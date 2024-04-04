import type { ProgressEvent, Request, Response } from "superagent";
import { waitForProps } from "../webpack";

interface HTTPAttachment {
  file: string | Blob | Buffer;
  filename: string;
  name: string;
}

interface HTTPField {
  name: string;
  value: string;
}

interface HTTPRequest {
  url: string;
  attachments?: HTTPAttachment[];
  backoff?: Backoff;
  binary?: boolean;
  body?: Record<string, unknown>;
  context?: Record<string, unknown>;
  fields?: HTTPField[];
  headers?: Record<string, string>;
  oldFormErrors?: boolean;
  query?: string | Record<string, string>;
  reason?: string;
  retried?: number;
  retries?: number;
  signal?: AbortSignal;
  timeout?: number;
  interceptResponse?: (
    response: Response,
    retry: (
      headers?: Record<string, string>,
      interceptResponse?: HTTPRequest["interceptResponse"],
    ) => void,
    reject: (reason: Error) => void,
  ) => boolean;
  onRequestCreated?: (request: Request) => void;
  onRequestProgress?: (progress: ProgressEvent) => void;
}

export interface HTTPResponse<T = Record<string, unknown>> {
  body: T;
  headers: Record<string, string>;
  ok: boolean;
  status: number;
  text: string;
}

export declare class Backoff {
  public constructor(min?: number, max?: number | null, jitter?: boolean);

  private _callback?: () => void;
  private _current: number;
  private _fails: number;
  private _timeoutId?: number;

  public jitter: boolean;
  public max: number;
  public min: number;

  public get current(): number;
  public get fails(): number;
  public get pending(): boolean;

  public cancel: () => void;
  public fail: (callback?: () => void) => number;
  public succeed: () => void;
}

declare class V6OrEarlierAPIError {
  public constructor(error: Record<string, unknown> | null, code: number, message?: string);

  public code: number;
  public error: Error;
  public fields: Record<string, unknown>;
  public message: string;
  public retryAfter: number | undefined;
  public status: number;

  public getFieldMessage: (field: string) => unknown;
}

export declare class APIError {
  public constructor(error: Record<string, unknown> | null, code: number, message?: string);

  public captchaFields: Record<string, unknown>;
  public code: number;
  public errors: Record<string, { _errors: Array<{ code: string; message: string }> }> | undefined;
  public message: string;
  public retryAfter: number | undefined;
  public status: number;

  public getAnyErrorMessage: () => string | { fieldName: string | null; error: string };
  public getAnyErrorMessageAndField: () => { fieldName: string | null; error: string } | null;
  public getFieldErrors: (
    field: string | string[],
  ) => Array<{ code: string; message: string }> | undefined;
  public getFirstFieldErrorMessage: (field: string | string[]) => string | null;
  public hasFieldErrors: () => boolean;
}

type HTTP = Record<
  "get" | "post" | "put" | "patch" | "del",
  <T = Record<string, unknown>>(
    req: string | HTTPRequest,
    callback?: (response: HTTPResponse) => void,
  ) => Promise<HTTPResponse<T>>
>;

interface RequestPatch {
  prepareRequest: (request: Request) => void;
  interceptResponse: Required<HTTPRequest["interceptResponse"]>;
}

export interface API {
  INVALID_FORM_BODY_ERROR_CODE: number;
  convertSkemaError: (response: Record<string, unknown>) => Record<string, unknown>;
  V6OrEarlierAPIError: typeof V6OrEarlierAPIError;
  V8APIError: typeof APIError;
  HTTP: HTTP;
  getAPIBaseURL: (version?: boolean) => string;
  setAwaitOnline: (callback: (url: string) => Promise<void>) => void;
  setRequestPatch: (patch: RequestPatch) => void;
}

export default await waitForProps<API>("getAPIBaseURL", "HTTP");
