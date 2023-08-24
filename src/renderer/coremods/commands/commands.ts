import { CommandManager } from "../../apis/commands";
import { ApplicationCommandOptionType, RepluggedCommand } from "../../../types";
import { Messages } from "@common/i18n";
import { plugins, themes } from "@replugged";
const command = new CommandManager();

const commands: RepluggedCommand[] = [
  {
    name: "enable",
    description: Messages.REPLUGGED_COMMAND_ENABLE_DESC,
    usage: "/enable <plugin/theme>",
    options: [
      {
        name: "addon",
        description: "Choose the addon you want to enable",
        type: ApplicationCommandOptionType.String,
        required: true,
        get choices() {
          const choices = [];

          const disabledPlugins = Array.from(plugins.plugins.values()).filter((plugin) =>
            plugins.getDisabled().includes(plugin.manifest.id),
          );

          const disabledThemes = Array.from(themes.themes.values()).filter((theme) =>
            themes.getDisabled().includes(theme.manifest.id),
          );

          choices.push(
            ...disabledPlugins
              .map((plugin) => ({
                name: plugin.manifest.name,
                displayName: `Plugin: ${plugin.manifest.name}`,
                value: plugin.manifest.id,
              }))
              .sort((a, b) => a.name.localeCompare(b.name)),
          );
          choices.push(
            ...disabledThemes
              .map((theme) => ({
                name: theme.manifest.name,
                displayName: `Theme: ${theme.manifest.name}`,
                value: theme.manifest.id,
              }))
              .sort((a, b) => a.name.localeCompare(b.name)),
          );

          return choices;
        },
      },
    ],
    executor: async (interaction) => {
      try {
        const addonId = interaction.getValue<string>("addon", "");
        if (plugins.plugins.has(addonId)) {
          await plugins.enable(addonId);
        } else {
          themes.enable(addonId);
        }
        return {
          send: false,
          embeds: [
            {
              type: "rich",
              color: 0x1bbb1b,
              title: "Success",
              description: `${plugins.plugins.get(addonId) ? "Plugin" : "Theme"} ${
                plugins.plugins.get(addonId)?.manifest?.name ??
                themes.themes.get(addonId)?.manifest?.name
              } has been enabled!`,
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
              description: err as string,
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
          const choices = [];

          const enabledPlugins = Array.from(plugins.plugins.values()).filter(
            (plugin) => !plugins.getDisabled().includes(plugin.manifest.id),
          );

          const enabledThemes = Array.from(themes.themes.values()).filter(
            (theme) => !themes.getDisabled().includes(theme.manifest.id),
          );

          choices.push(
            ...enabledPlugins
              .map((plugin) => ({
                name: plugin.manifest.name,
                displayName: `Plugin: ${plugin.manifest.name}`,
                value: plugin.manifest.id,
              }))
              .sort((a, b) => a.name.localeCompare(b.name)),
          );
          choices.push(
            ...enabledThemes
              .map((theme) => ({
                name: theme.manifest.name,
                displayName: `Theme: ${theme.manifest.name}`,
                value: theme.manifest.id,
              }))
              .sort((a, b) => a.name.localeCompare(b.name)),
          );

          return choices;
        },
      },
    ],
    executor: async (interaction) => {
      try {
        const addonId = interaction.getValue<string>("addon", "");
        if (plugins.plugins.has(addonId)) {
          await plugins.disable(addonId);
        } else {
          themes.disable(addonId);
        }
        return {
          send: false,
          embeds: [
            {
              type: "rich",
              color: 0x1bbb1b,
              title: "Success",
              description: `${plugins.plugins.get(addonId) ? "Plugin" : "Theme"}: ${
                plugins.plugins.get(addonId)?.manifest?.name ??
                themes.themes.get(addonId)?.manifest?.name
              } has been disabled!`,
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
              description: err as string,
            },
          ],
        };
      }
    },
  },
  {
    name: "reload",
    description: "Reload a plugin or theme",
    usage: "/reload <plugin/theme>",
    options: [
      {
        name: "addon",
        description: "Choose the addon you want to reload",
        type: ApplicationCommandOptionType.String,
        required: true,
        get choices() {
          const choices = [];

          const enabledPlugins = Array.from(plugins.plugins.values());
          const enabledThemes = Array.from(themes.themes.values());

          choices.push(
            ...enabledPlugins
              .map((plugin) => ({
                name: plugin.manifest.name,
                displayName: `Plugin: ${plugin.manifest.name}`,
                value: plugin.manifest.id,
              }))
              .sort((a, b) => a.name.localeCompare(b.name)),
          );
          choices.push(
            ...enabledThemes
              .map((theme) => ({
                name: theme.manifest.name,
                displayName: `Theme: ${theme.manifest.name}`,
                value: theme.manifest.id,
              }))
              .sort((a, b) => a.name.localeCompare(b.name)),
          );

          return choices;
        },
      },
    ],
    executor: async (interaction) => {
      try {
        const addonId = interaction.getValue<string>("addon", "");
        if (plugins.plugins.has(addonId)) {
          await plugins.reload(addonId);
        } else {
          themes.reload(addonId);
        }
        return {
          send: false,
          embeds: [
            {
              type: "rich",
              color: 0x1bbb1b,
              title: "Success",
              description: `${plugins.plugins.get(addonId) ? "Plugin" : "Theme"}: ${
                plugins.plugins.get(addonId)?.manifest?.name ??
                themes.themes.get(addonId)?.manifest?.name
              } has been reloaded!`,
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
              description: err as string,
            },
          ],
        };
      }
    },
  },
  {
    name: "list",
    description: "List all plugins/themes",
    usage: "/list <plugin/theme>",
    options: [
      {
        name: "send",
        description: "Whether you want to send this or not.",
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
      {
        name: "type",
        description: "Choose what type of addons to list.",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          {
            name: "Theme",
            displayName: `List themes`,
            value: "theme",
          },
          {
            name: "Plugin",
            displayName: `List plugins`,
            value: "plugin",
          },
        ],
      },
      {
        name: "version",
        description: "Whether you want to add version info.",
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
      {
        name: "status",
        description: "Whether you want to send either only enabled, disabled or all themes.",
        type: ApplicationCommandOptionType.String,
        required: false,
        choices: [
          {
            name: "Enabled",
            displayName: "Enabled",
            value: "enabled",
          },
          {
            name: "Disabled",
            displayName: "Disabled",
            value: "disabled",
          },
          {
            name: "Both",
            displayName: "Both",
            value: "default",
          },
        ],
      },
    ],
    executor: (interaction) => {
      try {
        const send = interaction.getValue<boolean>("send", false);
        const addonType = interaction.getValue<string>("type", "plugin");
        const version = interaction.getValue<boolean>("version", true);
        const listType = interaction.getValue<string>("status", "default");

        const generateListString = (
          items: Array<{ name: string; version: string }>,
          typeColor: string,
          typeName: string,
        ): string =>
          `[2;${typeColor}m[1;${typeColor}m${typeName} (${items.length}):[0m[2;${typeColor}m[0m\n${items
            .map((item) => (version ? `${item.name} (v${item.version})` : item.name))
            .join("\n• ")}`;

        switch (addonType) {
          case "plugin": {
            const allPlugins = Array.from(plugins.plugins.values())
              .map((p) => p.manifest)
              .sort((a, b) => a.name.localeCompare(b.name));
            const enablePlugins = allPlugins.filter((p) => !plugins.getDisabled().includes(p.id));
            const disabledPlugins = allPlugins.filter((p) => plugins.getDisabled().includes(p.id));

            const enabledString = generateListString(enablePlugins, "32", "Enabled Plugins");
            const disabledString = generateListString(disabledPlugins, "31", "Disabled Plugins");

            const result =
              listType === "enabled"
                ? enabledString
                : listType === "disabled"
                ? disabledString
                : `${enabledString}\n\n${disabledString}`;

            return {
              send,
              result: `\`\`\`ansi\n${result}\n\`\`\``,
            };
          }
          case "theme": {
            const allThemes = Array.from(themes.themes.values())
              .map((t) => t.manifest)
              .sort((a, b) => a.name.localeCompare(b.name));
            const enableThemes = allThemes.filter((t) => !plugins.getDisabled().includes(t.id));
            const disabledThemes = allThemes.filter((t) => plugins.getDisabled().includes(t.id));

            const enabledString = generateListString(enableThemes, "32", "Enabled Themes");
            const disabledString = generateListString(disabledThemes, "31", "Disabled Themes");

            const result =
              listType === "enabled"
                ? enabledString
                : listType === "disabled"
                ? disabledString
                : `${enabledString}\n\n${disabledString}`;

            return {
              send,
              result: `\`\`\`ansi\n${result}\n\`\`\``,
            };
          }
          default:
            return {
              send: false,
              result: "You need to specify whether to send a plugin or theme list",
            };
        }
      } catch (err) {
        return {
          send: false,
          embeds: [
            {
              type: "rich",
              color: 0xdd2d2d,
              title: "Error",
              description: err as string,
            },
          ],
        };
      }
    },
  },
];

export function loadCommands(): void {
  for (const cmd of commands) {
    command.registerCommand(cmd);
  }
}

export function unloadCommands(): void {
  command.unregisterAllCommands();
}
