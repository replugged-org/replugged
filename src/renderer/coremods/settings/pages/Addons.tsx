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
  type,
  disabled,
  toggleDisabled,
}: {
  addon: RepluggedPlugin | RepluggedTheme;
  type: AddonType;
  disabled: boolean;
  toggleDisabled: () => void;
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
      <Flex justify={Flex.Justify.END}>
        <SwitchItem checked={!disabled} onChange={toggleDisabled} />
      </Flex>
    </div>
  );
}

function Cards({
  type,
  disabled,
  setDisabled,
}: {
  type: AddonType;
  disabled: Set<string>;
  setDisabled: (disabled: Set<string>) => void;
}) {
  const list = [...listAddons(type).values()];

  return (
    <div className="replugged-addon-cards">
      {list.map((addon) => (
        <Card
          addon={addon}
          type={type}
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

  React.useEffect(() => {
    (async () => {
      const minWait = new Promise((resolve) => setTimeout(resolve, 500));
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
        <h1 className="h1-34Txb0 title-3hptVQ defaultColor-2cKwKo defaultMarginh1-EURXsm">
          {label(type, { caps: "title", plural: true })}
        </h1>
        <Button onClick={() => openFolder(type)}>
          Open {label(type, { caps: "title", plural: true })} Folder
        </Button>
      </Flex>
      <Divider style={{ margin: "20px 0px" }} />
      {loading ? (
        <Flex justify={Flex.Justify.CENTER} style={{ paddingTop: "40px" }}>
          <Loading />
        </Flex>
      ) : (
        <Cards type={type} disabled={disabled} setDisabled={setDisabled} />
      )}
    </div>
  );
};

export const Plugins = () => Addons(AddonType.Plugin);
export const Themes = () => Addons(AddonType.Theme);
