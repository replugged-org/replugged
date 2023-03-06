import { registerCommand } from "../../apis/commands";
import { ApplicationCommandOptionType, RepluggedCommand } from "../../../types";
import { plugins, themes } from "@replugged";

const commands: RepluggedCommand[] = [
  {
    name: "enable",
    description: "Enable a plugin or theme",
    usage: "/enable <plugin/theme>",
    options: [
      {
        name: "addon",
        description: "Choose the addon you want to enable",
        type: ApplicationCommandOptionType.String,
        required: true,
        get choices() {
          let choices = [];

          const disabledPlugins = Array.from(plugins.plugins.values()).filter((plugin) =>
            plugins.getDisabled().includes(plugin.manifest.id),
          );

          const disabledThemes = Array.from(themes.themes.values()).filter((theme) =>
            themes.getDisabled().includes(theme.manifest.id),
          );

          choices.push(
            ...disabledPlugins.map((plugin) => ({
              name: plugin.manifest.name,
              displayName: plugin.manifest.name,
              value: plugin.manifest.id,
            })),
          );
          choices.push(
            ...disabledThemes.map((theme) => ({
              name: theme.manifest.name,
              displayName: theme.manifest.name,
              value: theme.manifest.id,
            })),
          );

          return choices;
        },
      },
    ],
    executor: async (args) => {
      try {
        await plugins.enable(args[0].value);
        return {
          send: false,
          embeds: [
            {
              type: "rich",
              color: 0x1bbb1b,
              title: "Success",
              description: `${args[0].value} has been enabled!`,
            },
          ],
        };
      } catch (err) {
        return {
          send: false,
          embeds: [
            {
              type: "rich",
              color: 0xdd2d2d,
              title: "Error",
              description: err,
            },
          ],
        };
      }
    },
  },
  {
    name: "disable",
    description: "Disable a plugin or theme",
    usage: "/disable <plugin/theme>",
    options: [
      {
        name: "addon",
        description: "Choose the addon you want to disable",
        type: ApplicationCommandOptionType.String,
        required: true,
        get choices() {
          let choices = [];

          const enabledPlugins = Array.from(plugins.plugins.values()).filter(
            (plugin) => !plugins.getDisabled().includes(plugin.manifest.id),
          );

          const enabledThemes = Array.from(themes.themes.values()).filter(
            (theme) => !themes.getDisabled().includes(theme.manifest.id),
          );

          choices.push(
            ...enabledPlugins.map((plugin) => ({
              name: plugin.manifest.name,
              displayName: plugin.manifest.name,
              value: plugin.manifest.id,
            })),
          );
          choices.push(
            ...enabledThemes.map((theme) => ({
              name: theme.manifest.name,
              displayName: theme.manifest.name,
              value: theme.manifest.id,
            })),
          );

          return choices;
        },
      },
    ],
    executor: async (args) => {
      try {
        await plugins.disable(args[0].value);
        return {
          send: false,
          embeds: [
            {
              type: "rich",
              color: 0x1bbb1b,
              title: "Success",
              description: `${args[0].value} has been disabled!`,
            },
          ],
        };
      } catch (err) {
        return {
          send: false,
          embeds: [
            {
              type: "rich",
              color: 0xdd2d2d,
              title: "Error",
              description: err,
            },
          ],
        };
      }
    },
  },
];

export function loadCommands(): void {
  for (const command of commands) {
    registerCommand(command);
  }
}
