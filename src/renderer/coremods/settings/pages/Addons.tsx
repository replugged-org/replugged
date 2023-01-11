import { api, fluxDispatcher, users } from "@common";
import React from "@common/react";
import { Button, Divider, Flex, Input, SwitchItem } from "@components";
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
    const { body } = await api
      .get({
        url: `/users/${id}/profile`,
        query: {
          // eslint-disable-next-line camelcase
          with_mutual_friends_count: "false",
          // eslint-disable-next-line camelcase
          with_mutual_guilds: "false",
        },
      })
      .catch(
        async () =>
          await api.get({
            url: `/users/${id}`,
          }),
      );
    const user = body.user ?? body;
    fluxDispatcher.dispatch({ type: "USER_UPDATE", user });
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
      {author.discordID && (
        <a
          onClick={() => openUserProfile(author.discordID!)}
          className="replugged-addon-icon replugged-addon-icon-author">
          <Icons.Discord />
        </a>
      )}
      {author.github && (
        <a
          href={`https://github.com/${author.github}`}
          target="_blank"
          className="replugged-addon-icon replugged-addon-icon-author">
          <Icons.GitHub />
        </a>
      )}
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

// todo: proper text elements
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
      <h2 className="defaultColor-1EVLSt heading-md-normal-3Ytn6I">
        <span className="heading-lg-bold-3uwrwG">{addon.manifest.name}</span>{" "}
        <span className="heading-lg-normal-1bqh2L">v{addon.manifest.version}</span> by{" "}
        <Authors addon={addon} />
      </h2>
      <p style={{ margin: "5px 0" }}>{addon.manifest.description}</p>
      <Flex justify={Flex.Justify.END} align={Flex.Align.CENTER} style={{ gap: "10px" }}>
        {sourceLink && (
          <a href={sourceLink} target="_blank" className="replugged-addon-icon">
            <Icons.Link />
          </a>
        )}
        <a onClick={() => uninstall()} className="replugged-addon-icon">
          <Icons.Trash />
        </a>
        <SwitchItem checked={!disabled} onChange={toggleDisabled} />
      </Flex>
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

// todo: proper text elements
export const Addons = (type: AddonType) => {
  const [disabled, setDisabled] = React.useState<Set<string>>(new Set());
  const [search, setSearch] = React.useState("");
  const [list, setList] = React.useState<(RepluggedPlugin | RepluggedTheme)[]>([]);

  function refreshList() {
    setList(
      [...listAddons(type).values()]
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
    <div className="colorStandard-1Xxp1s size14-k_3Hy4">
      <Flex justify={Flex.Justify.BETWEEN} align={Flex.Align.CENTER}>
        <h1
          className="h1-34Txb0 title-3hptVQ defaultColor-2cKwKo"
          style={{
            // Do not turn "(num)" into a single symbol
            fontVariantLigatures: "none",
          }}>
          {label(type, { caps: "title", plural: true })} ({list.length})
        </h1>
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
      {list.length ? (
        <>
          <div style={{ marginBottom: "20px" }}>
            <Input placeholder={`Search for a ${label(type)}`} onChange={(e) => setSearch(e)} />
          </div>
          <Cards
            type={type}
            disabled={disabled}
            setDisabled={setDisabled}
            list={list}
            refreshList={refreshList}
          />
        </>
      ) : (
        <h1 className="h1-34Txb0 title-3hptVQ defaultColor-2cKwKo" style={{ textAlign: "center" }}>
          No {label(type, { plural: true })} installed.
        </h1>
      )}
    </div>
  );
};

export const Plugins = () => Addons(AddonType.Plugin);
export const Themes = () => Addons(AddonType.Theme);
