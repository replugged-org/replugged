import { i18n } from "@common";
import { Injector, plugins, themes } from "@recelled";
import { t } from "src/renderer/modules/i18n";
import { ApplicationCommandOptionType } from "../../../types";

const injector = new Injector();

const { intl } = i18n;

export function loadCommands(): void {
  injector.utils.registerSlashCommand({
    name: intl.string(t.RECELLED_COMMAND_ENABLE_NAME),
    description: intl.string(t.RECELLED_COMMAND_ENABLE_DESC),
    options: [
      {
        name: "addon",
        displayName: intl.string(t.RECELLED_COMMAND_ENABLE_OPTION_ADDON_NAME),
        description: intl.string(t.RECELLED_COMMAND_ADDONS_OPTION_ADDON_DESC),
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
                displayName: `${intl.string(t.RECELLED_PLUGIN)}: ${plugin.manifest.name}`,
                value: plugin.manifest.id,
              }))
              .sort((a, b) => a.name.localeCompare(b.name)),
          );
          choices.push(
            ...disabledThemes
              .map((theme) => ({
                name: theme.manifest.name,
                displayName: `${intl.string(t.RECELLED_THEME)}: ${theme.manifest.name}`,
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
              title: intl.string(t.RECELLED_COMMAND_SUCCESS_GENERIC),
              description: intl.formatToPlainString(t.RECELLED_COMMAND_ENABLE_MESSAGE_ENABLED, {
                type: plugins.plugins.get(addonId)
                  ? intl.string(t.RECELLED_PLUGIN)
                  : intl.string(t.RECELLED_THEME),
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
              title: intl.string(t.RECELLED_COMMAND_ERROR_GENERIC),
              description: err as string,
            },
          ],
        };
      }
    },
  });
  injector.utils.registerSlashCommand({
    name: intl.string(t.RECELLED_COMMAND_DISABLE_NAME),
    description: intl.string(t.RECELLED_COMMAND_DISABLE_DESC),
    options: [
      {
        name: "addon",
        displayName: intl.string(t.RECELLED_COMMAND_DISABLE_OPTION_ADDON_NAME),
        description: intl.string(t.RECELLED_COMMAND_DISABLE_OPTION_ADDON_DESC),
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
                displayName: `${intl.string(t.RECELLED_PLUGIN)}: ${plugin.manifest.name}`,
                value: plugin.manifest.id,
              }))
              .sort((a, b) => a.name.localeCompare(b.name)),
          );
          choices.push(
            ...enabledThemes
              .map((theme) => ({
                name: theme.manifest.name,
                displayName: `${intl.string(t.RECELLED_THEME)}: ${theme.manifest.name}`,
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
              title: intl.string(t.RECELLED_COMMAND_SUCCESS_GENERIC),
              description: intl.formatToPlainString(t.RECELLED_COMMAND_DISABLE_MESSAGE_ENABLED, {
                type: plugins.plugins.get(addonId)
                  ? intl.string(t.RECELLED_PLUGIN)
                  : intl.string(t.RECELLED_THEME),
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
              title: intl.string(t.RECELLED_COMMAND_ERROR_GENERIC),
              description: err as string,
            },
          ],
        };
      }
    },
  });
  injector.utils.registerSlashCommand({
    name: intl.string(t.RECELLED_COMMAND_RELOAD_NAME),
    description: intl.string(t.RECELLED_COMMAND_RELOAD_DESC),
    options: [
      {
        name: "addon",
        displayName: intl.string(t.RECELLED_COMMAND_RELOAD_OPTION_ADDON_NAME),
        description: intl.string(t.RECELLED_COMMAND_RELOAD_OPTION_ADDON_DESC),
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
                displayName: `${intl.string(t.RECELLED_PLUGIN)}: ${plugin.manifest.name}`,
                value: plugin.manifest.id,
              }))
              .sort((a, b) => a.name.localeCompare(b.name)),
          );
          choices.push(
            ...enabledThemes
              .map((theme) => ({
                name: theme.manifest.name,
                displayName: `${intl.string(t.RECELLED_THEME)}: ${theme.manifest.name}`,
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
              title: intl.string(t.RECELLED_COMMAND_SUCCESS_GENERIC),
              description: intl.formatToPlainString(t.RECELLED_COMMAND_RELOAD_MESSAGE_ENABLED, {
                type: plugins.plugins.get(addonId)
                  ? intl.string(t.RECELLED_PLUGIN)
                  : intl.string(t.RECELLED_THEME),
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
              title: intl.string(t.RECELLED_COMMAND_ERROR_GENERIC),
              description: err as string,
            },
          ],
        };
      }
    },
  });
  injector.utils.registerSlashCommand({
    name: intl.string(t.RECELLED_COMMAND_LIST_NAME),
    description: intl.string(t.RECELLED_COMMAND_LIST_DESC),
    options: [
      {
        name: "send",
        displayName: intl.string(t.RECELLED_COMMAND_LIST_OPTION_SEND_NAME),
        description: intl.string(t.RECELLED_COMMAND_LIST_OPTION_SEND_DESC),
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
      {
        name: "type",
        displayName: intl.string(t.RECELLED_COMMAND_LIST_OPTION_TYPE_NAME),
        description: intl.string(t.RECELLED_COMMAND_LIST_OPTION_TYPE_DESC),
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          {
            name: intl.string(t.RECELLED_COMMAND_LIST_OPTION_TYPE_CHOICE_THEME),
            displayName: intl.string(t.RECELLED_COMMAND_LIST_OPTION_TYPE_CHOICE_THEME),
            value: "theme",
          },
          {
            name: intl.string(t.RECELLED_COMMAND_LIST_OPTION_TYPE_CHOICE_PLUGIN),
            displayName: intl.string(t.RECELLED_COMMAND_LIST_OPTION_TYPE_CHOICE_PLUGIN),
            value: "plugin",
          },
        ],
      },
      {
        name: "version",
        displayName: intl.string(t.RECELLED_COMMAND_LIST_OPTION_VERSION_NAME),
        description: intl.string(t.RECELLED_COMMAND_LIST_OPTION_VERSION_DESC),
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
      {
        name: "status",
        displayName: intl.string(t.RECELLED_COMMAND_LIST_OPTION_STATUS_NAME),
        description: intl.string(t.RECELLED_COMMAND_LIST_OPTION_STATUS_DESC),
        type: ApplicationCommandOptionType.String,
        required: false,
        choices: [
          {
            name: intl.string(t.RECELLED_COMMAND_LIST_OPTION_STATUS_CHOICE_ENABLED),
            displayName: intl.string(t.RECELLED_COMMAND_LIST_OPTION_STATUS_CHOICE_ENABLED),
            value: "enabled",
          },
          {
            name: intl.string(t.RECELLED_COMMAND_LIST_OPTION_STATUS_CHOICE_DISABLED),
            displayName: intl.string(t.RECELLED_COMMAND_LIST_OPTION_STATUS_CHOICE_DISABLED),
            value: "disabled",
          },
          {
            name: intl.string(t.RECELLED_COMMAND_LIST_OPTION_STATUS_CHOICE_BOTH),
            displayName: intl.string(t.RECELLED_COMMAND_LIST_OPTION_STATUS_CHOICE_BOTH),
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
              intl.formatToPlainString(t.RECELLED_COMMAND_LIST_HEADER_ENABLED, {
                type: intl.string(t.RECELLED_PLUGINS),
              }),
            );
            const disabledString = generateListString(
              disabledPlugins,
              intl.formatToPlainString(t.RECELLED_COMMAND_LIST_HEADER_DISABLED, {
                type: intl.string(t.RECELLED_PLUGINS),
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
              intl.formatToPlainString(t.RECELLED_COMMAND_LIST_HEADER_ENABLED, {
                type: intl.string(t.RECELLED_THEMES),
              }),
            );
            const disabledString = generateListString(
              disabledThemes,
              intl.formatToPlainString(t.RECELLED_COMMAND_LIST_HEADER_DISABLED, {
                type: intl.string(t.RECELLED_THEMES),
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
              result: intl.string(t.RECELLED_COMMAND_LIST_ERROR_SPECIFY),
            };
        }
      } catch (err) {
        return {
          send: false,
          embeds: [
            {
              color: 0xdd2d2d,
              title: intl.string(t.RECELLED_COMMAND_ERROR_GENERIC),
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
