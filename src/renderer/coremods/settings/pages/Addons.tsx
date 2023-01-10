import { fluxDispatcher } from "@common";
import React from "@common/react";
import { Button, Divider, Flex, SwitchItem } from "@components";
import { webpack } from "@replugged";
import { RepluggedPlugin, RepluggedTheme } from "src/types";
import "./Addons.css";

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

function openUserProfile(id: string) {
  fluxDispatcher.dispatch({
    type: "USER_PROFILE_MODAL_OPEN",
    userId: id,
  });
}

function getAuthors(addon: RepluggedPlugin | RepluggedTheme) {
  return [addon.manifest.author].flat();
}

function openFolder(type: AddonType) {
  getRepluggedNative(type).openFolder();
}

async function loadMissing(type: AddonType) {
  const native = getRepluggedNative(type);
  const disabled = await native.listDisabled();
  if (type === AddonType.Plugin) {
    const manager = window.replugged.plugins;
    const existingPlugins = new Set(manager.plugins.keys());
    await manager.loadAll();
    const newPlugins = Array.from(manager.plugins.keys()).filter(
      (x) => !existingPlugins.has(x) && !disabled.includes(x),
    );
    await Promise.all(newPlugins.map((x) => manager.start(x)));
  }
  if (type === AddonType.Theme) {
    const manager = window.replugged.themes;
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
  }: { caps?: "lower" | "title" | "upper" | undefined; plural?: boolean | undefined },
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
  return (
    <div className="replugged-addon-card">
      <h2 className="defaultColor-1EVLSt heading-lg-bold-3uwrwG">
        {addon.manifest.name} v{addon.manifest.version}
      </h2>
      <p>{addon.manifest.description}</p>
      <h3 className="defaultColor-1EVLSt eyebrow-Ejf06y">
        Author{getAuthors(addon).length === 1 ? "" : "s"}
      </h3>
      {getAuthors(addon).map((author, i) => (
        <div key={i}>
          <span>{author.name}</span>
          {/* todo: icons */}
          {author.discordID && (
            <a style={{ paddingLeft: "10px" }} onClick={() => openUserProfile(author.discordID!)}>
              Discord
            </a>
          )}
          {author.github && (
            <a
              style={{ paddingLeft: "10px" }}
              href={`https://github.com/${author.github}`}
              target="_blank">
              GitHub
            </a>
          )}
        </div>
      ))}
      <Flex justify={Flex.Justify.END} align={Flex.Align.CENTER}>
        <a onClick={() => uninstall()} style={{ marginRight: "5px" }}>
          Uninstall
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
      {list
        .sort((a, b) => a.manifest.name.toLowerCase().localeCompare(b.manifest.name.toLowerCase()))
        .map((addon) => (
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

function Loading() {
  const mod = webpack.getBySource("wanderingCubes");
  if (!mod || typeof mod !== "object") return null;
  const Spinner = Object.values(mod).find((x) => typeof x === "function") as React.FC<{
    type: string;
    animated?: boolean;
  }> | null;
  if (!Spinner) return null;

  return <Spinner type="wanderingCubes" animated={true} />;
}

// todo: proper text elements
export const Addons = (type: AddonType) => {
  const [loading, setLoading] = React.useState(true);
  const [disabled, setDisabled] = React.useState<Set<string>>(new Set());
  const [list, setList] = React.useState<(RepluggedPlugin | RepluggedTheme)[]>([]);

  function refreshList() {
    setList([...listAddons(type).values()]);
  }

  React.useEffect(() => {
    (async () => {
      const minWait = new Promise((resolve) => setTimeout(resolve, 500));
      refreshList();
      const native = getRepluggedNative(type);
      const disabled = await native.listDisabled();
      setDisabled(new Set(disabled));
      await minWait;
      setLoading(false);
    })();
  }, []);

  return (
    <div className="colorStandard-1Xxp1s size14-k_3Hy4">
      <Flex justify={Flex.Justify.BETWEEN} align={Flex.Align.CENTER}>
        <h1 className="h1-34Txb0 title-3hptVQ defaultColor-2cKwKo">
          {label(type, { caps: "title", plural: true })}
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
      {loading ? (
        <Flex justify={Flex.Justify.CENTER} style={{ paddingTop: "40px" }}>
          <Loading />
        </Flex>
      ) : (
        <Cards
          type={type}
          disabled={disabled}
          setDisabled={setDisabled}
          list={list}
          refreshList={refreshList}
        />
      )}
    </div>
  );
};

export const Plugins = () => Addons(AddonType.Plugin);
export const Themes = () => Addons(AddonType.Theme);
