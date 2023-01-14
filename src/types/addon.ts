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

export const common = z.object({
  // Should be in RDNN format
  id,
  name: z.string(),
  description: z.string(),
  author: z.union([author, author.array().nonempty()]),
  version: z.string(),
  updater: z
    .object({
      type: z.literal("github"),
      id: z.string(),
    })
    .optional(),
  license: z.string(),
});

export type Common = z.infer<typeof common>;

export const theme = common.extend({
  type: z.literal("replugged-theme"),
  main: z.string(),
  splash: z.string().optional(),
});

export type ThemeManifest = z.infer<typeof theme>;

export const plugin = common.extend({
  type: z.literal("replugged-plugin"),
  main: z.string().optional(),
  preload: z.string().optional(),
  renderer: z.string().optional(),
  plaintextPatches: z.string().optional(),
  dependencies: z
    .object({
      required: id.array(),
      optional: id.array(),
    })
    .partial()
    .optional(),
  dependents: z
    .object({
      required: id.array(),
      optional: id.array(),
    })
    .partial()
    .optional(),
});

export type PluginManifest = z.infer<typeof plugin>;

export interface PluginExports {
  start?: () => Promisable<void>;
  stop?: () => Promisable<void>;
  [x: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type AddonSettings = {
  disabled?: string[];
};
