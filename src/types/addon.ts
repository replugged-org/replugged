import { z } from "zod";

export const id = z
  .string()
  .regex(
    /^(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z0-9][A-Za-z0-9-]{0,61}[A-Za-z0-9]$/,
  );

export type Id = z.infer<typeof id>;

export const author = z.object({
  name: z.string(),
  discordID: z.string(),
  github: z.string(),
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

export type Theme = z.infer<typeof theme>;

export const plugin = common.extend({
  type: z.literal("replugged-plugin"),
  main: z.string().optional(),
  preload: z.string().optional(),
  renderer: z.string().optional(),
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

export type Plugin = z.infer<typeof plugin>;
