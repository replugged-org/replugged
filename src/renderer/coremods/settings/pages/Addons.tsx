import { api, fluxDispatcher, users } from "@common";
import React from "@common/react";
import { Button, Divider, Flex, Input, SwitchItem, Text } from "@components";
import { RepluggedPlugin, RepluggedTheme } from "src/types";
import "./Addons.css";
import Icons from "../icons";

enum AddonType {
  Plugin = "plugin",
  Theme = "theme",
}

function getRepluggedNative(type: AddonType) {
  if (type === AddonType.Plugin) {
    return window.RepluggedNative.plugins;
  }
  if (type === AddonType.Theme) {
    return window.RepluggedNative.themes;
  }
  throw new Error("Invalid addon type");
}

function getManager(type: AddonType) {
  if (type === AddonType.Plugin) {
    return window.replugged.plugins;
  }
  if (type === AddonType.Theme) {
    return window.replugged.themes;
  }
  throw new Error("Invalid addon type");
}

function listAddons(type: AddonType) {
  if (type === AddonType.Plugin) {
    return window.replugged.plugins.plugins;
  }
  if (type === AddonType.Theme) {
    return window.replugged.themes.themes;
  }
  throw new Error("Invalid addon type");
}

async function openUserProfile(id: string) {
  if (!users.getUser(id)) {
    try {
      const { body } = await api.get({
        url: `/users/${id}/profile`,
        query: {
          // eslint-disable-next-line camelcase
          with_mutual_friends_count: "true",
          // eslint-disable-next-line camelcase
          with_mutual_guilds: "true",
        },
      });
      fluxDispatcher.dispatch({ type: "USER_UPDATE", user: body.user });
      fluxDispatcher.dispatch({ type: "USER_PROFILE_FETCH_SUCCESS", ...body });
    } catch (e) {
      const { body } = await api.get({
        url: `/users/${id}`,
      });
      fluxDispatcher.dispatch({ type: "USER_UPDATE", user: body });
    }
  }
  fluxDispatcher.dispatch({
    type: "USER_PROFILE_MODAL_OPEN",
    userId: id,
  });
}

function getAuthors(addon: RepluggedPlugin | RepluggedTheme) {
  return [addon.manifest.author].flat();
}

function getSourceLink(addon: RepluggedPlugin | RepluggedTheme): string | undefined {
  const { updater } = addon.manifest;
  if (!updater) return undefined;
  const { type, id } = updater;
  switch (type) {
    case "github":
      return `https://github.com/${id}`;
  }
  return undefined;
}

function openFolder(type: AddonType) {
  getRepluggedNative(type).openFolder();
}

async function loadMissing(type: AddonType) {
  if (type === AddonType.Plugin) {
    const manager = window.replugged.plugins;
    const disabled = manager.getDisabled();
    const existingPlugins = new Set(manager.plugins.keys());
    await manager.loadAll();
    const newPlugins = Array.from(manager.plugins.keys()).filter(
      (x) => !existingPlugins.has(x) && !disabled.includes(x),
    );
    await Promise.all(newPlugins.map((x) => manager.start(x)));
  }
  if (type === AddonType.Theme) {
    const manager = window.replugged.themes;
    const disabled = manager.getDisabled();
    const existingThemes = new Set(manager.themes.keys());
    await manager.loadMissing();
    const newThemes = Array.from(manager.themes.keys()).filter(
      (x) => !existingThemes.has(x) && !disabled.includes(x),
    );
    newThemes.map((x) => manager.load(x));
  }
}

function label(
  type: AddonType,
  {
    caps,
    plural,
  }: { caps?: "lower" | "title" | "upper" | undefined; plural?: boolean | undefined } = {},
) {
  caps ??= "lower";
  plural ??= false;

  let base: string = "";
  if (type === AddonType.Plugin) {
    base = "Plugin";
  }
  if (type === AddonType.Theme) {
    base = "Theme";
  }
  if (plural) {
    base += "s";
  }
  if (caps === "lower") {
    base = base.toLowerCase();
  }
  if (caps === "upper") {
    base = base.toUpperCase();
  }

  return base;
}

function Authors({ addon }: { addon: RepluggedPlugin | RepluggedTheme }) {
  const els = getAuthors(addon).map((author, i) => (
    <Flex
      key={i}
      align={Flex.Align.CENTER}
      style={{
        gap: "5px",
        display: "inline-flex",
      }}>
      <b>{author.name}</b>
      {author.discordID ? (
        <a
          onClick={() => openUserProfile(author.discordID!)}
          className="replugged-addon-icon replugged-addon-icon-author">
          <Icons.Discord />
        </a>
      ) : null}
      {author.github ? (
        <a
          href={`https://github.com/${author.github}`}
          target="_blank"
          className="replugged-addon-icon replugged-addon-icon-author">
          <Icons.GitHub />
        </a>
      ) : null}
    </Flex>
  ));

  if (els.length === 1) {
    return els[0];
  }
  if (els.length === 2) {
    return (
      <span>
        {els[0]}
        <span style={{ padding: "0 5px" }}>and</span>
        {els[1]}
      </span>
    );
  }
  return (
    <span>
      {els.slice(0, -1).map((x, i) => (
        <React.Fragment key={i}>
          {x}
          <span style={{ paddingRight: "5px" }}>,</span>
        </React.Fragment>
      ))}
      <span style={{ paddingRight: "5px" }}>and</span>
      {els[els.length - 1]}
    </span>
  );
}

function Card({
  addon,
  disabled,
  toggleDisabled,
  uninstall,
}: {
  addon: RepluggedPlugin | RepluggedTheme;
  disabled: boolean;
  toggleDisabled: () => void;
  uninstall: () => void;
}) {
  const sourceLink = getSourceLink(addon);

  return (
    <div className="replugged-addon-card">
      <Flex
        align={Flex.Align.START}
        justify={Flex.Justify.BETWEEN}
        style={{ gap: "15px", marginBottom: "15px" }}>
        <span>
          <Text variant="heading-sm/normal" tag="h2" color="header-secondary">
            <Text variant="heading-lg/bold" tag="span">
              {addon.manifest.name}
            </Text>{" "}
            <Text variant="heading-lg/normal" tag="span">
              v{addon.manifest.version}
            </Text>
            <span> by </span>
            <Authors addon={addon} />
          </Text>
        </span>
        <Flex align={Flex.Align.CENTER} justify={Flex.Justify.END} style={{ gap: "10px" }}>
          {sourceLink ? (
            <a href={sourceLink} target="_blank" className="replugged-addon-icon">
              <Icons.Link />
            </a>
          ) : null}
          <a onClick={() => uninstall()} className="replugged-addon-icon">
            <Icons.Trash />
          </a>
          <SwitchItem checked={!disabled} onChange={toggleDisabled} />
        </Flex>
      </Flex>
      <Text.Normal style={{ margin: "5px 0" }} markdown={true} allowMarkdownLinks={true}>
        {addon.manifest.description}
      </Text.Normal>
    </div>
  );
}

function Cards({
  type,
  disabled,
  setDisabled,
  list,
  refreshList,
}: {
  type: AddonType;
  disabled: Set<string>;
  setDisabled: (disabled: Set<string>) => void;
  list: (RepluggedPlugin | RepluggedTheme)[];
  refreshList: () => void;
}) {
  return (
    <div className="replugged-addon-cards">
      {list.map((addon) => (
        <Card
          addon={addon}
          key={addon.manifest.id}
          disabled={disabled.has(addon.manifest.id)}
          toggleDisabled={() => {
            const isDisabled = disabled.has(addon.manifest.id);
            const clonedDisabled = new Set(disabled);
            const manager = getManager(type);
            if (isDisabled) {
              clonedDisabled.delete(addon.manifest.id);
              manager.enable(addon.manifest.id);
            } else {
              clonedDisabled.add(addon.manifest.id);
              manager.disable(addon.manifest.id);
            }
            setDisabled(clonedDisabled);
          }}
          uninstall={async () => {
            // todo: prompt
            const manager = getManager(type);
            await manager.uninstall(addon.manifest.id);
            refreshList();
          }}
        />
      ))}
    </div>
  );
}

export const Addons = (type: AddonType) => {
  const [disabled, setDisabled] = React.useState<Set<string>>(new Set());
  const [search, setSearch] = React.useState("");
  const [list, setList] = React.useState<(RepluggedPlugin | RepluggedTheme)[] | null>();
  const [unfilteredCount, setUnfilteredCount] = React.useState(0);

  function refreshList() {
    const list = [...listAddons(type).values()];
    setUnfilteredCount(list.length);
    setList(
      list
        .filter((x) => {
          const props = [
            x.manifest.name,
            x.manifest.id,
            x.manifest.description,
            ...[x.manifest.author].flat().map(Object.values).flat(),
          ].map((x) => x.toLowerCase());

          return props.some((x) => x.includes(search.toLowerCase()));
        })
        .sort((a, b) => a.manifest.name.toLowerCase().localeCompare(b.manifest.name.toLowerCase())),
    );

    setDisabled(new Set(getManager(type).getDisabled()));
  }

  React.useEffect(refreshList, [search]);

  return (
    <>
      <Flex justify={Flex.Justify.BETWEEN} align={Flex.Align.START}>
        <Text.H2
          style={{
            // Do not turn "(num)" into a single symbol
            fontVariantLigatures: "none",
          }}>
          {label(type, { caps: "title", plural: true })} ({unfilteredCount})
        </Text.H2>
        <div style={{ display: "flex" }}>
          <Button onClick={() => openFolder(type)}>
            Open {label(type, { caps: "title", plural: true })} Folder
          </Button>
          <Button
            onClick={async () => {
              await loadMissing(type);
              refreshList();
            }}
            color={Button.Colors.PRIMARY}
            look={Button.Looks.LINK}>
            Load Missing {label(type, { caps: "title", plural: true })}
          </Button>
        </div>
      </Flex>
      <Divider style={{ margin: "20px 0px" }} />
      {unfilteredCount ? (
        <div style={{ marginBottom: "20px" }}>
          <Input
            placeholder={`Search for a ${label(type)}`}
            onChange={(e) => setSearch(e)}
            autoFocus={true}
          />
        </div>
      ) : null}
      {search && list?.length ? (
        <Text variant="heading-md/bold" style={{ marginBottom: "10px" }}>
          {`${list.length} match${list.length === 1 ? "" : "es"}`}
        </Text>
      ) : null}
      {list?.length ? (
        <>
          <Cards
            type={type}
            disabled={disabled}
            setDisabled={setDisabled}
            list={list}
            refreshList={refreshList}
          />
        </>
      ) : list ? (
        <Text variant="heading-lg/bold" style={{ textAlign: "center" }}>
          {unfilteredCount
            ? `No ${label(type, { plural: true })} matched your search.`
            : `No ${label(type, { plural: true })} installed.`}
        </Text>
      ) : null}
    </>
  );
};

export const Plugins = () => Addons(AddonType.Plugin);
export const Themes = () => Addons(AddonType.Theme);
