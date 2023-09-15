import { Injector } from "@replugged";
import { ApplicationCommandOptionType } from "src/types";
import { INSTALLER_SOURCES, InstallerSource, getInfo, install } from "./util";

const injector = new Injector();

export function loadCommands(): void {
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
          // TODO: i18n
          displayName: v,
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

    async executor(interaction) {
      const identifier = interaction.getValue("identifier");
      const source = interaction.getValue("source") as InstallerSource | undefined;
      const id = interaction.getValue("id");

      const info = await getInfo(identifier, source, id);

      if (!info) {
        return {
          send: false,
          // TODO: i18n?
          result: "Error: couldn't fetch the plugin",
        };
      }

      const success = await install(info);

      return {
        send: false,
        // TODO: i18n
        result: success ? "Success: Addon installed" : "Error: plugin fetched but not installed",
      };
    },
  });
}

export function unloadCommands(): void {
  injector.uninjectAll();
}
