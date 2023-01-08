export type UpdaterType = "replugged-plugin" | "replugged-theme";

export interface UpdateCheckResultSuccess {
  success: true;
  id?: string;
  url?: string;
}

export interface UpdateCheckResultFailure {
  success: false;
  error: string | null;
}

export interface UpdateInstallResultSuccess {
  success: true;
}

export interface UpdateInstallResultFailure {
  success: false;
  error: string | null;
}
