import { Injector, Logger } from "@replugged";
import { filters, getByProps, getByStoreName, waitForModule } from "src/renderer/modules/webpack";
import { users } from "@common";
import type React from "react";
import type { Store } from "src/renderer/modules/common/flux";
import type { Message } from "discord-types/general";

const inject = new Injector();
//const logger = Logger.coremod("UtilityClasses");
const html = document.documentElement;

interface TabBarItemProps {
  id: string;
  "aria-controls"?: string;
}

interface TabBarItemType extends React.Component<TabBarItemProps> {
  render(): React.ReactElement<TabBarItemProps>;
}

// Re-adds the tab bar item's ID as an always-present attribute
function tabBarItemId(): void {
  const TabBarModule = getByProps<{ TabBar: { Item: { prototype: TabBarItemType } } }>("TabBar");
  if (!TabBarModule) {
    throw new Error("Failed to find TabBar module!");
  }

  inject.after(
    TabBarModule.TabBar.Item.prototype,
    "render",
    function (this: TabBarItemType, _, res) {
      if (typeof this.props.id === "string") {
        res.props["aria-controls"] = `${this.props.id.replace(/\s+/g, "-").toLowerCase()}-tab`;
      }
      return res;
    },
  );
}

interface ClientThemesBackgroundStore extends Store {
  gradientPreset: {
    id: number;
  };
}
type ThemeIDMap = Record<string, number> & Record<number, string>;

function onNitroThemeChange(store: ClientThemesBackgroundStore, ThemeIDMap: ThemeIDMap): void {
  if (!store.gradientPreset) {
    html.removeAttribute("data-nitro-theme");
  } else {
    const theme = ThemeIDMap[store.gradientPreset.id];
    html.setAttribute("data-nitro-theme", theme);
  }
}

// Adds the currently active nitro theme as a class on the html element
function nitroThemeClass(): void {
  const ClientThemesBackgroundStore = getByStoreName<ClientThemesBackgroundStore>(
    "ClientThemesBackgroundStore",
  );
  if (!ClientThemesBackgroundStore) {
    throw new Error("Failed to find ClientThemesBackgroundStore!");
  }
  const ThemeIDMap = getByProps<ThemeIDMap>("MINT_APPLE");
  if (!ThemeIDMap) {
    throw new Error("Failed to find ThemeIDs module!");
  }

  // update theme attribute when theme changes
  ClientThemesBackgroundStore.addChangeListener(() => {
    onNitroThemeChange(ClientThemesBackgroundStore, ThemeIDMap);
  });
  onNitroThemeChange(ClientThemesBackgroundStore, ThemeIDMap);
}

interface MessageComponent {
  props: { id: string };
  type: {
    type: (msg: { message: Message }) => React.ReactElement;
  };
}

async function messageDataAttributes(): Promise<void> {
  const MessagesComponent = await waitForModule<{
    type: () => React.ReactElement;
  }>(filters.bySource(".content.id)"));

  const uninjectMessagesComponent = inject.after(MessagesComponent, "type", (_, res) => {
    uninjectMessagesComponent();

    const MessageListComponent = res.props.children.type;
    const uninjectMessageList = inject.after(MessageListComponent, "type", (_, res) => {
      const messagesArray = res.props.children.props.children[1].props.children[1].props
        .children[1] as MessageComponent[];
      const messageElement = messagesArray.find((e) => e.props.id !== undefined);

      // messageElement isn't found when first loading the message list.
      if (messageElement) {
        uninjectMessageList();
        // found a message component, inject into it
        inject.after(messageElement.type, "type", ([{ message }], res) => {
          const { props } = res.props.children.props.children;
          props["data-is-author-self"] = message.author.id === users.getCurrentUser().id;
          props["data-is-author-bot"] = message.author.bot;
          if (message.author.bot) {
            props["data-is-author-webhook"] = message.webhookId !== null;
          }
          props["data-author-id"] = message.author.id;
          props["data-message-type"] = message.type;
          if (message.blocked) props["data-is-blocked"] = "true";
          return res;
        });
      }

      return res;
    });
    return res;
  });
}

export async function start(): Promise<void> {
  tabBarItemId();
  nitroThemeClass();
  await messageDataAttributes();
}

export function stop(): void {
  inject.uninjectAll();
}
