import { i18n } from "@common";
import toast from "@common/toast";
import { Logger, plugins, themes } from "@recelled";
import { t } from "src/renderer/modules/i18n";
import { registerRPCCommand } from "../rpc";

const logger = Logger.coremod("Watcher");

const uninjectors: Array<() => void> = [];

const { intl } = i18n;

export function start(): void {
  let uninjectRpc = registerRPCCommand("REPLUGGED_ADDON_WATCHER", {
    scope: "REPLUGGED_LOCAL",
    handler: async (data) => {
      const { id } = data.args;

      if (typeof id !== "string") throw new Error("Invalid or missing addon ID.");
      const plugin = plugins.plugins.get(id);
      const theme = themes.themes.get(id);
      if (!plugin && !theme) {
        return {
          success: false,
          error: "ADDON_NOT_FOUND",
        };
      }
      const addon = (plugin ?? theme)!;
      if ([...themes.getDisabled(), ...plugins.getDisabled()].includes(addon.manifest.id)) {
        return {
          success: false,
          error: "ADDON_DISABLED",
        };
      }

      logger.log(`Got request to reload ${addon.manifest.id}.`);

      try {
        if (plugin) {
          await plugins.reload(id);
        } else {
          themes.reload(id);
        }

        toast.toast(
          intl.formatToPlainString(t.RECELLED_TOAST_ADDON_RELOAD_SUCCESS, {
            name: addon.manifest.name,
          }),
        );

        return {
          success: true,
        };
      } catch (err) {
        logger.error(`Failed to reload ${addon.manifest.id}`, err);

        toast.toast(
          intl.formatToPlainString(t.RECELLED_TOAST_ADDON_RELOAD_FAILED, {
            name: addon.manifest.name,
          }),
          toast.Kind.FAILURE,
        );

        return {
          success: false,
          error: "RELOAD_FAILED",
        };
      }
    },
  });

  uninjectors.push(uninjectRpc);
}

export function stop(): void {
  uninjectors.forEach((uninject) => uninject());
}
