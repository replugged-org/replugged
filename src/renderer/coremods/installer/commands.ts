import { Injector } from "@replugged";
import { ApplicationCommandOptionType } from "src/types";
import { INSTALLER_SOURCES, InstallerSource, installFlow } from "./util";

/**
 * A map of display names for installer sources.
 */
const sourceDisplayNames: Record<InstallerSource, string> = {
  github: "GitHub",
  // TODO: i18n
  store: "store",
};

export function loadCommands(injector: Injector): void {
  injector.utils.registerSlashCommand({
    name: "install",
    // TODO: i18n
    displayName: "install",
    // TODO: i18n
    description: "Install an addon",
    options: [
      {
        name: "identifier",
        // TODO: i18n
        description: "The addon's updater id",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "source",
        // TODO: i18n
        displayName: "source",
        // TODO: i18n
        description: `The addon source`,
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
        // TODO: i18n
        displayName: "id",
        // TODO: i18n
        description: `A plugin ID that used by monorepo plugins only`,
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],

    async executor(i) {
      await installFlow(i.getValue("identifier"), i.getValue("source"), i.getValue("id"));
      return null;
    },
  });
}
