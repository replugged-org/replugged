import { generalSettings } from "../settings/pages/General";

export function getEnabled(): boolean {
  return generalSettings.get("experiments");
}
