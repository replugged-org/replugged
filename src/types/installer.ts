import type { AnyAddonManifest, RepluggedManifest } from "./addon";

export type InstallerType = AnyAddonManifest["type"];

export interface CheckResultSuccess {
  success: true;
  manifest: AnyAddonManifest | RepluggedManifest;
  name: string;
  url: string;
  webUrl?: string;
}

export interface ResultFailure {
  success: false;
  error: string | null;
}

export interface InstallResultSuccess {
  success: true;
}

export interface ListResultSuccess {
  success: true;
  numPages: number;
  page: number;
  list: Array<{
    manifest: AnyAddonManifest;
    name: string;
    url: string;
  }>;
}
