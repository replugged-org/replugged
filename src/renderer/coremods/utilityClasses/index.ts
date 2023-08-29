import { Injector } from "@replugged";
import type React from "react";
import { getByProps } from "src/renderer/modules/webpack";

const injector = new Injector();

interface TabBarItemProps {
  id: string;
  "aria-controls"?: string;
}

interface TabBarItemType extends React.Component<TabBarItemProps> {
  render(): React.ReactElement<TabBarItemProps>;
}

export function start(): void {
  const mod = getByProps<{ TabBar: { Item: { prototype: TabBarItemType } } }>("TabBar");
  if (!mod) {
    throw new Error("Failed to find TabBar module!");
  }

  injector.after(mod.TabBar.Item.prototype, "render", function (this: TabBarItemType, _, res) {
    if (typeof this.props.id === "string") {
      res.props["aria-controls"] = `${this.props.id.replace(/\s+/g, "-").toLowerCase()}-tab`;
    }
    return res;
  });
}

export function stop(): void {
  injector.uninjectAll();
}
