import { AnyAddonManifest, RepluggedManifest } from "./addon";

export type InstallerType = AnyAddonManifest["type"];

export interface CheckResultSuccess {
  success: true;
  manifest: AnyAddonManifest | RepluggedManifest;
  name: string;
  url: string;
  webUrl?: string;
}

export interface CheckResultFailure {
  success: false;
  error: string | null;
}

export interface InstallResultSuccess {
  success: true;
}

export interface InstallResultFailure {
  success: false;
  error: string | null;
}
