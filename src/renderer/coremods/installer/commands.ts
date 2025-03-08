import { intl } from "@common/i18n";
import { Injector } from "@replugged";
import { t } from "src/renderer/modules/i18n";
import { ApplicationCommandOptionType } from "src/types";
import { INSTALLER_SOURCES, InstallerSource, installFlow, parseInstallLink } from "./util";

/**
 * A map of display names for installer sources.
 */
const sourceDisplayNames: Record<InstallerSource, string> = {
  github: "GitHub",
  store: intl.string(t.REPLUGGED_STORE),
};

export function loadCommands(injector: Injector): void {
  injector.utils.registerSlashCommand({
    name: "install",
    displayName: intl.string(t.REPLUGGED_COMMAND_INSTALL_NAME),
    description: intl.string(t.REPLUGGED_COMMAND_INSTALL_DESC),
    options: [
      {
        name: "addon",
        displayName: intl.string(t.REPLUGGED_COMMAND_INSTALL_OPTION_ADDON_NAME),
        description: intl.string(t.REPLUGGED_COMMAND_INSTALL_OPTION_ADDON_DESC),
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "source",
        displayName: intl.string(t.REPLUGGED_COMMAND_INSTALL_OPTION_SOURCE_NAME),
        description: intl.string(t.REPLUGGED_COMMAND_INSTALL_OPTION_SOURCE_DESC),
        type: ApplicationCommandOptionType.String,
        required: false,
        choices: INSTALLER_SOURCES.map((v) => ({
          name: v,
          displayName: sourceDisplayNames[v],
          value: v,
        })),
      },
      {
        name: "id",
        displayName: intl.string(t.REPLUGGED_COMMAND_INSTALL_OPTION_ID_NAME),
        description: intl.string(t.REPLUGGED_COMMAND_INSTALL_OPTION_ID_DESC),
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],

    async executor(i) {
      let addon = i.getValue("addon");
      let source = i.getValue("source");
      let id = i.getValue("id");

      const linkParsed = parseInstallLink(addon);

      if (linkParsed) {
        ({ identifier: addon, source, id } = linkParsed);
      }

      const resp = await installFlow(addon, source, id, false);

      switch (resp.kind) {
        case "FAILED":
          return {
            result: intl.string(t.REPLUGGED_TOAST_INSTALLER_ADDON_FETCH_INFO_FAILED),
          };
        case "ALREADY_INSTALLED":
          return {
            result: intl.formatToPlainString(t.REPLUGGED_ERROR_ALREADY_INSTALLED, {
              name: resp.manifest.name,
            }),
          };
        case "CANCELLED":
          return {
            result: intl.string(t.REPLUGGED_TOAST_INSTALLER_ADDON_CANCELED_INSTALL),
          };
        case "SUCCESS":
          return {
            result: intl.formatToPlainString(t.REPLUGGED_TOAST_INSTALLER_ADDON_INSTALL_SUCCESS, {
              name: resp.manifest.name,
            }),
          };
      }
    },
  });
}
