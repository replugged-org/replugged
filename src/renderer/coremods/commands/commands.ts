import { Messages } from "@common/i18n";
import { Injector, plugins, themes } from "@replugged";
import { ApplicationCommandOptionType } from "../../../types";

const injector = new Injector();

export function loadCommands(): void {
  injector.utils.registerSlashCommand({
    name: Messages.REPLUGGED_COMMAND_ENABLE_NAME,
    description: Messages.REPLUGGED_COMMAND_ENABLE_DESC,
    options: [
      {
        name: "addon",
        displayName: Messages.REPLUGGED_COMMAND_ENABLE_OPTION_ADDON_NAME,
        description: Messages.REPLUGGED_COMMAND_ADDONS_OPTION_ADDON_DESC,
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
                displayName: `${Messages.REPLUGGED_PLUGIN}: ${plugin.manifest.name}`,
                value: plugin.manifest.id,
              }))
              .sort((a, b) => a.name.localeCompare(b.name)),
          );
          choices.push(
            ...disabledThemes
              .map((theme) => ({
                name: theme.manifest.name,
                displayName: `${Messages.REPLUGGED_THEME}: ${theme.manifest.name}`,
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
        const addonId = interaction.getValue("addon");
        if (plugins.plugins.has(addonId)) {
          await plugins.enable(addonId);
        } else {
          themes.enable(addonId);
        }
        return {
          send: false,
          embeds: [
            {
              color: 0x1bbb1b,
              title: Messages.REPLUGGED_COMMAND_SUCCESS_GENERIC,
              description: Messages.REPLUGGED_COMMAND_ENABLE_MESSAGE_ENABLED.format({
                type: plugins.plugins.get(addonId)
                  ? Messages.REPLUGGED_PLUGIN
                  : Messages.REPLUGGED_THEME,
                name:
                  plugins.plugins.get(addonId)?.manifest.name ??
                  themes.themes.get(addonId)?.manifest.name,
              }),
            },
          ],
        };
      } catch (err) {
        return {
          send: false,
          embeds: [
            {
              color: 0xdd2d2d,
              title: Messages.REPLUGGED_COMMAND_ERROR_GENERIC,
              description: err as string,
            },
          ],
        };
      }
    },
  });
  injector.utils.registerSlashCommand({
    name: Messages.REPLUGGED_COMMAND_DISABLE_NAME,
    description: Messages.REPLUGGED_COMMAND_DISABLE_DESC,
    options: [
      {
        name: "addon",
        displayName: Messages.REPLUGGED_COMMAND_DISABLE_OPTION_ADDON_NAME,
        description: Messages.REPLUGGED_COMMAND_DISABLE_OPTION_ADDON_DESC,
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
                displayName: `${Messages.REPLUGGED_PLUGIN}: ${plugin.manifest.name}`,
                value: plugin.manifest.id,
              }))
              .sort((a, b) => a.name.localeCompare(b.name)),
          );
          choices.push(
            ...enabledThemes
              .map((theme) => ({
                name: theme.manifest.name,
                displayName: `${Messages.REPLUGGED_THEME}: ${theme.manifest.name}`,
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
        const addonId = interaction.getValue("addon");
        if (plugins.plugins.has(addonId)) {
          await plugins.disable(addonId);
        } else {
          themes.disable(addonId);
        }
        return {
          send: false,
          embeds: [
            {
              color: 0x1bbb1b,
              title: Messages.REPLUGGED_COMMAND_SUCCESS_GENERIC,
              description: Messages.REPLUGGED_COMMAND_DISABLE_MESSAGE_ENABLED.format({
                type: plugins.plugins.get(addonId)
                  ? Messages.REPLUGGED_PLUGIN
                  : Messages.REPLUGGED_THEME,
                name:
                  plugins.plugins.get(addonId)?.manifest.name ??
                  themes.themes.get(addonId)?.manifest.name,
              }),
            },
          ],
        };
      } catch (err) {
        return {
          send: false,
          embeds: [
            {
              color: 0xdd2d2d,
              title: Messages.REPLUGGED_COMMAND_ERROR_GENERIC,
              description: err as string,
            },
          ],
        };
      }
    },
  });
  injector.utils.registerSlashCommand({
    name: Messages.REPLUGGED_COMMAND_RELOAD_NAME,
    description: Messages.REPLUGGED_COMMAND_RELOAD_DESC,
    options: [
      {
        name: "addon",
        displayName: Messages.REPLUGGED_COMMAND_RELOAD_OPTION_ADDON_NAME,
        description: Messages.REPLUGGED_COMMAND_RELOAD_OPTION_ADDON_DESC,
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
                displayName: `${Messages.REPLUGGED_PLUGIN}: ${plugin.manifest.name}`,
                value: plugin.manifest.id,
              }))
              .sort((a, b) => a.name.localeCompare(b.name)),
          );
          choices.push(
            ...enabledThemes
              .map((theme) => ({
                name: theme.manifest.name,
                displayName: `${Messages.REPLUGGED_THEME}: ${theme.manifest.name}`,
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
        const addonId = interaction.getValue("addon");
        if (plugins.plugins.has(addonId)) {
          await plugins.reload(addonId);
        } else {
          themes.reload(addonId);
        }
        return {
          send: false,
          embeds: [
            {
              color: 0x1bbb1b,
              title: Messages.REPLUGGED_COMMAND_SUCCESS_GENERIC,
              description: Messages.REPLUGGED_COMMAND_RELOAD_MESSAGE_ENABLED.format({
                type: plugins.plugins.get(addonId)
                  ? Messages.REPLUGGED_PLUGIN
                  : Messages.REPLUGGED_THEME,
                name:
                  plugins.plugins.get(addonId)?.manifest.name ??
                  themes.themes.get(addonId)?.manifest.name,
              }),
            },
          ],
        };
      } catch (err) {
        return {
          send: false,
          embeds: [
            {
              color: 0xdd2d2d,
              title: Messages.REPLUGGED_COMMAND_ERROR_GENERIC,
              description: err as string,
            },
          ],
        };
      }
    },
  });
  injector.utils.registerSlashCommand({
    name: Messages.REPLUGGED_COMMAND_LIST_NAME,
    description: Messages.REPLUGGED_COMMAND_LIST_DESC,
    options: [
      {
        name: "send",
        displayName: Messages.REPLUGGED_COMMAND_LIST_OPTION_SEND_NAME,
        description: Messages.REPLUGGED_COMMAND_LIST_OPTION_SEND_DESC,
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
      {
        name: "type",
        displayName: Messages.REPLUGGED_COMMAND_LIST_OPTION_TYPE_NAME,
        description: Messages.REPLUGGED_COMMAND_LIST_OPTION_TYPE_DESC,
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          {
            name: Messages.REPLUGGED_COMMAND_LIST_OPTION_TYPE_CHOICE_THEME,
            displayName: Messages.REPLUGGED_COMMAND_LIST_OPTION_TYPE_CHOICE_THEME,
            value: "theme",
          },
          {
            name: Messages.REPLUGGED_COMMAND_LIST_OPTION_TYPE_CHOICE_PLUGIN,
            displayName: Messages.REPLUGGED_COMMAND_LIST_OPTION_TYPE_CHOICE_PLUGIN,
            value: "plugin",
          },
        ],
      },
      {
        name: "version",
        displayName: Messages.REPLUGGED_COMMAND_LIST_OPTION_VERSION_NAME,
        description: Messages.REPLUGGED_COMMAND_LIST_OPTION_VERSION_DESC,
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
      {
        name: "status",
        displayName: Messages.REPLUGGED_COMMAND_LIST_OPTION_STATUS_NAME,
        description: Messages.REPLUGGED_COMMAND_LIST_OPTION_STATUS_DESC,
        type: ApplicationCommandOptionType.String,
        required: false,
        choices: [
          {
            name: Messages.REPLUGGED_COMMAND_LIST_OPTION_STATUS_CHOICE_ENABLED,
            displayName: Messages.REPLUGGED_COMMAND_LIST_OPTION_STATUS_CHOICE_ENABLED,
            value: "enabled",
          },
          {
            name: Messages.REPLUGGED_COMMAND_LIST_OPTION_STATUS_CHOICE_DISABLED,
            displayName: Messages.REPLUGGED_COMMAND_LIST_OPTION_STATUS_CHOICE_DISABLED,
            value: "disabled",
          },
          {
            name: Messages.REPLUGGED_COMMAND_LIST_OPTION_STATUS_CHOICE_BOTH,
            displayName: Messages.REPLUGGED_COMMAND_LIST_OPTION_STATUS_CHOICE_BOTH,
            value: "default",
          },
        ],
      },
    ],
    executor: (interaction) => {
      try {
        const send = interaction.getValue("send", false);
        const addonType = interaction.getValue("type");
        const version = interaction.getValue("version", true);
        const listType = interaction.getValue("status", "default");

        const generateListString = (
          items: Array<{ name: string; version: string }>,
          typeName: string,
        ): string =>
          `## ${typeName} (${items.length})${items.length ? ":\n•" : ""} ${items
            .map((item) => (version ? `${item.name} (v${item.version})` : item.name))
            .join("\n• ")}`;

        switch (addonType) {
          case "plugin": {
            const allPlugins = Array.from(plugins.plugins.values())
              .map((p) => p.manifest)
              .sort((a, b) => a.name.localeCompare(b.name));
            const enablePlugins = allPlugins.filter((p) => !plugins.getDisabled().includes(p.id));
            const disabledPlugins = allPlugins.filter((p) => plugins.getDisabled().includes(p.id));

            const enabledString = generateListString(
              enablePlugins,
              Messages.REPLUGGED_COMMAND_LIST_HEADER_ENABLED.format({
                type: Messages.REPLUGGED_PLUGINS,
              }),
            );
            const disabledString = generateListString(
              disabledPlugins,
              Messages.REPLUGGED_COMMAND_LIST_HEADER_DISABLED.format({
                type: Messages.REPLUGGED_PLUGINS,
              }),
            );

            const result =
              listType === "enabled"
                ? enabledString
                : listType === "disabled"
                ? disabledString
                : `${enabledString}\n\n${disabledString}`;

            return {
              send,
              result,
            };
          }
          case "theme": {
            const allThemes = Array.from(themes.themes.values())
              .map((t) => t.manifest)
              .sort((a, b) => a.name.localeCompare(b.name));
            const enableThemes = allThemes.filter((t) => !plugins.getDisabled().includes(t.id));
            const disabledThemes = allThemes.filter((t) => plugins.getDisabled().includes(t.id));

            const enabledString = generateListString(
              enableThemes,
              Messages.REPLUGGED_COMMAND_LIST_HEADER_ENABLED.format({
                type: Messages.REPLUGGED_THEMES,
              }),
            );
            const disabledString = generateListString(
              disabledThemes,
              Messages.REPLUGGED_COMMAND_LIST_HEADER_DISABLED.format({
                type: Messages.REPLUGGED_THEMES,
              }),
            );

            const result =
              listType === "enabled"
                ? enabledString
                : listType === "disabled"
                ? disabledString
                : `${enabledString}\n\n${disabledString}`;

            return {
              send,
              result,
            };
          }
          default:
            return {
              send: false,
              result: Messages.REPLUGGED_COMMAND_LIST_ERROR_SPECIFY,
            };
        }
      } catch (err) {
        return {
          send: false,
          embeds: [
            {
              color: 0xdd2d2d,
              title: Messages.REPLUGGED_COMMAND_ERROR_GENERIC,
              description: err as string,
            },
          ],
        };
      }
    },
  });
}

export function unloadCommands(): void {
  injector.uninjectAll();
}
