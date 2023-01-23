import { UpdateCheckResultFailure, UpdateCheckResultSuccess } from "src/types";

// First item is the default
const INSTALLER_TYPES = ["github"] as const;

const cache: Map<string, { data: UpdateCheckResultSuccess; expires: Date }> = new Map();

export async function getInfo(
  type: (typeof INSTALLER_TYPES)[number],
  identifier: string,
  id?: string,
): Promise<UpdateCheckResultSuccess | UpdateCheckResultFailure> {
  const cacheIdentifier = `${type}:${identifier}:${id ?? ""}`;
  const cached = cache.get(cacheIdentifier);
  if (cached && cached.expires > new Date()) {
    return cached.data;
  }

  const info = await RepluggedNative.installer.getInfo(type, identifier, id);
  if (!info.success) return info;

  cache.set(cacheIdentifier, {
    data: info,
    expires: new Date(Date.now() + 1000 * 60 * 10),
  });

  return info;
}
