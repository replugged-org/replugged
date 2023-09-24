import { Injector } from "@replugged";
import { ApplicationCommandOptionType } from "src/types";
import { INSTALLER_SOURCES, InstallerSource, installFlow, parseInstallLink } from "./util";
import { Messages } from "@common/i18n";

/**
 * A map of display names for installer sources.
 */
const sourceDisplayNames: Record<InstallerSource, string> = {
  github: "GitHub",
  store: Messages.REPLUGGED_STORE,
};

export function loadCommands(injector: Injector): void {
  injector.utils.registerSlashCommand({
    name: "install",
    displayName: Messages.REPLUGGED_COMMAND_INSTALL_NAME,
    description: Messages.REPLUGGED_COMMAND_INSTALL_DESC,
    options: [
      {
        name: "addon",
        displayName: Messages.REPLUGGED_COMMAND_INSTALL_OPTION_ADDON_NAME,
        description: Messages.REPLUGGED_COMMAND_INSTALL_OPTION_ADDON_DESC,
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "source",
        displayName: Messages.REPLUGGED_COMMAND_INSTALL_OPTION_SOURCE_NAME,
        description: Messages.REPLUGGED_COMMAND_INSTALL_OPTION_SOURCE_DESC,
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
        displayName: Messages.REPLUGGED_COMMAND_INSTALL_OPTION_ID_NAME,
        description: Messages.REPLUGGED_COMMAND_INSTALL_OPTION_ID_DESC,
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],

    async executor(i) {
      let addon = i.getValue("addon")
      let source = i.getValue("source")
      let id = i.getValue("id")
      
      try {
        // If addon is not a url, this will throw an error
        const _ = new URL(addon)
        const resp = parseInstallLink(addon)
        if (resp) {
          addon = resp.identifier
          source = resp.source
          id = resp.id
        }
      } catch {}
      
      await installFlow(addon, source, id, false);
      return null;
    },
  });
}