import { z } from "zod";
import type { Promisable } from "type-fest";

export const id = z
  .string()
  .regex(
    /^(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z0-9][A-Za-z0-9-]{0,61}[A-Za-z0-9]$/,
  );

export type Id = z.infer<typeof id>;

export const author = z.object({
  name: z.string(),
  discordID: z.string().optional(),
  github: z.string().optional(),
});

export type Author = z.infer<typeof author>;

const urlType = z.string().url();

export const common = z.object({
  // Should be in RDNN format
  id,
  name: z.string(),
  description: z.string(),
  author: z.union([author, author.array().nonempty()]),
  version: z.string(),
  updater: z
    .object({
      type: z.enum(["store", "github"]),
      id: z.string(),
    })
    .optional(),
  license: z.string(),
  image: z.union([urlType, urlType.array().nonempty()]).optional(),
  source: urlType.optional(),
});

export type Common = z.infer<typeof common>;

export const recelledManifest = common.extend({
  type: z.literal("recelled"),
});

export type ReCelledManifest = z.infer<typeof recelledManifest>;

export interface ReCelledEntity {
  manifest: ReCelledManifest;
  path: string;
}

export const theme = common.extend({
  type: z.literal("replugged-theme"),
  main: z.string().optional(),
  splash: z.string().optional(),
});

export type ThemeManifest = z.infer<typeof theme>;

export const plugin = common.extend({
  type: z.literal("replugged-plugin"),
  renderer: z.string().optional(),
  plaintextPatches: z.string().optional(),
  reloadRequired: z.boolean().optional(),
});

export type PluginManifest = z.infer<typeof plugin>;

export const anyAddon = z.discriminatedUnion("type", [theme, plugin]);

export type AnyAddonManifest = z.infer<typeof anyAddon>;

export const anyAddonOrReCelled = z.discriminatedUnion("type", [recelledManifest, theme, plugin]);

export type AnyAddonManifestOrReCelled = z.infer<typeof anyAddonOrReCelled>;

export interface PluginExports {
  start?: () => Promisable<void>;
  stop?: () => Promisable<void>;
  Settings?: React.ComponentType;
  [x: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type AddonSettings = {
  disabled?: string[];
};
