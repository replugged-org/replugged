import { Logger, plugins } from "@replugged";
import { React, components, localStorage } from "@common";
import { Button, Divider, ErrorBoundary, Flex, Modal, Notice, Text } from "@components";
import { t as discordT, intl } from "@common/i18n";
import { t } from "../../modules/i18n";
import { getFunctionBySource } from "@webpack";
import { SAFE_MODE_KEY } from "src/constants";
import { Updater } from "../settings/pages";
import { PatchIds } from "../../modules/webpack/plaintext-patch";

const logger = Logger.coremod("SoftCrash");

import "./style.css";

const PluginInjectionRegex = /replugged:\/\/plugin\/([\w.]+)\//g;

const PatchedWebpackRegex = /\/assets\/patched\/PatchedWebpack-(\d+):/g;

interface TabBarProps extends React.HTMLAttributes<HTMLDivElement> {
  type: string;
  look?: string;
  selectedItem: string;
  onItemSelect: (newItem: string) => void;
}

interface TabBarItemProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  key: string;
  disabled?: boolean;
}

interface TabBar extends React.FC<TabBarProps> {
  Item: React.FC<TabBarItemProps>;
}

interface CrashDetailsProps {
  error: Error;
  info: { componentStack: string };
  resetError: () => void;
}

function DetailsModalContent({
  error,
  info,
  openKey,
  pluginIds,
  setDisabled,
  disabled,
}: {
  openKey: string;
  pluginIds: Set<string | undefined>;
  setDisabled: React.Dispatch<React.SetStateAction<string[]>>;
  disabled: string[];
} & Partial<CrashDetailsProps>): React.ReactElement {
  switch (openKey) {
    case "error-stack":
      return (
        <div className="replugged-crash-details-stack">
          {error!.stack && (
            <>
              <code>{error!.stack}</code>
              <br />
              <br />
            </>
          )}
          {info!.componentStack && <code>Component Stack: {info!.componentStack}</code>}
        </div>
      );
    case "updater": {
      return (
        <div style={{ margin: "10px 0px" }}>
          <Updater crashed={true} />
        </div>
      );
    }
    case "plugins":
      return (
        <ErrorBoundary>
          {[...pluginIds].map((c) => {
            if (!c) return null;
            const plugin = plugins.plugins.get(c);
            return (
              <ErrorBoundary key={`${c}-${disabled.includes(c)}`}>
                <Flex
                  justify={Flex.Justify.BETWEEN}
                  align={Flex.Align.CENTER}
                  style={{ margin: "10px 0px" }}>
                  <Text.Eyebrow style={{ fontSize: "16px" }}>{plugin?.manifest.name}</Text.Eyebrow>
                  <Button
                    disabled={disabled.includes(c)}
                    onClick={() => {
                      void plugins.disable(c);
                      setDisabled((v) => [...v, c]);
                    }}>
                    {intl.string(discordT.DISABLE)}
                  </Button>
                </Flex>
                <Divider style={{ margin: "10px 0px" }} />
              </ErrorBoundary>
            );
          })}
        </ErrorBoundary>
      );
    default:
      return <></>;
  }
}

function DetailsModal({
  error,
  info,
  resetError,
  pluginIds,
  ...props
}: {
  pluginIds: Set<string | undefined>;
  onClose: () => void;
  style?: React.CSSProperties;
} & CrashDetailsProps): React.ReactElement {
  const TabBar = getFunctionBySource<TabBar>(components, "this.tabBarRef")!;
  const [open, setOpen] = React.useState<string>("error-stack");
  const [disabled, setDisabled] = React.useState<string[]>([]);
  return (
    <Modal.ModalRoot
      {...props}
      size="large"
      className="replugged-crashDetails-modal"
      style={{ opacity: 1, transform: "scale(1)" }}>
      <Modal.ModalHeader className="replugged-crashDetails-header">
        <Text.H2
          style={{
            marginTop: 10,
          }}>
          {intl.string(t.REPLUGGED_SOFT_CRASH_DETAILS)}
        </Text.H2>
        <Modal.ModalCloseButton onClick={props.onClose} />
      </Modal.ModalHeader>
      <TabBar
        type="top"
        look="brand"
        style={{ paddingLeft: "15px" }}
        selectedItem={open}
        onItemSelect={setOpen}>
        <TabBar.Item id="error-stack" key="error-stack" {...props}>
          {intl.string(t.REPLUGGED_SOFT_CRASH_ERROR_STACK)}
        </TabBar.Item>
        <TabBar.Item id="updater" key="updater" {...props}>
          {intl.string(t.REPLUGGED_UPDATES_UPDATER)}
        </TabBar.Item>
        <TabBar.Item disabled={!pluginIds.size} id="plugins" key="plugins" {...props}>
          {intl.formatToPlainString(t.REPLUGGED_SOFT_CRASH_SUSPECTED_PLUGINS, {
            count: pluginIds.size,
          })}
        </TabBar.Item>
      </TabBar>
      <Modal.ModalContent className="replugged-crashDetails-content">
        <ErrorBoundary>
          <DetailsModalContent
            openKey={open}
            error={error}
            info={info}
            pluginIds={pluginIds}
            setDisabled={setDisabled}
            disabled={disabled}
          />
        </ErrorBoundary>
      </Modal.ModalContent>
      <Modal.ModalFooter className="replugged-crashDetails-footer">
        {disabled.length ? (
          <Notice
            messageType={Notice.HelpMessageTypes.WARNING}
            className="replugged-crash-reloadButton">
            <Flex justify={Flex.Justify.BETWEEN} style={{ gap: "15px" }}>
              <Text variant="text-md/normal">
                {intl.string(t.REPLUGGED_SOFT_CRASH_RELOAD_REQUIRED)}
              </Text>
              <Button
                color={Button.Colors.GREEN}
                look={Button.Looks.OUTLINED}
                onClick={() => setTimeout(() => window.location.reload(), 250)}>
                {intl.string(discordT.ERRORS_RELOAD)}
              </Button>
            </Flex>
          </Notice>
        ) : (
          <Flex justify={Flex.Justify.BETWEEN}>
            <Button
              color={Button.Colors.RED}
              look={Button.Looks.OUTLINED}
              onClick={() => resetError()}>
              {intl.string(t.REPLUGGED_SOFT_CRASH_TRY_RECOVERY)}
            </Button>
            <Button
              color={Button.Colors.BRAND}
              look={Button.Looks.OUTLINED}
              onClick={() => {
                localStorage.set(SAFE_MODE_KEY, true);
                setTimeout(() => window.location.reload(), 250);
              }}>
              {intl.string(t.REPLUGGED_SOFT_CRASH_SAFE_RELOAD)}
            </Button>
          </Flex>
        )}
      </Modal.ModalFooter>
    </Modal.ModalRoot>
  );
}

function CrashDetails({ resetError, error, info }: CrashDetailsProps): React.ReactElement {
  const [modalOpen, setModalOpen] = React.useState(false);

  React.useEffect(() => {
    const listener = (v: KeyboardEvent): void => {
      if (v.key === "F5") resetError();
      if (v.key === "Escape") setModalOpen(false);
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, []);

  const InjectionPluginIds = Array.from(
    error.stack!.matchAll(PluginInjectionRegex),
    ([, id]) => id,
  );

  const PlaintextPluginIds = Array.from(error.stack!.matchAll(PatchedWebpackRegex), ([, id]) =>
    PatchIds[id]?.filter((c) => c && !c.startsWith("replugged.coremod")),
  ).flat(10);

  React.useEffect(() => {
    logger.info(
      "Addons found in error stack",
      new Set([...InjectionPluginIds, ...PlaintextPluginIds]),
    );
  }, [InjectionPluginIds.length, PlaintextPluginIds.length]);

  return (
    <ErrorBoundary fallback={<></>}>
      <Button
        size={Button.Sizes.LARGE}
        onClick={() => setModalOpen(true)}
        style={{ marginLeft: "10px" }}>
        {intl.string(discordT.MORE_DETAILS)}
      </Button>
      <div
        className="replugged-crashDetails-backdrop"
        style={modalOpen ? { display: "flex" } : { display: "none" }}>
        <DetailsModal
          onClose={() => setModalOpen(false)}
          style={
            modalOpen
              ? { opacity: 1 }
              : { opacity: 0, transform: "scale(0.9) translate(-50%, -50%)" }
          }
          pluginIds={new Set([...InjectionPluginIds, ...PlaintextPluginIds])}
          resetError={resetError}
          error={error}
          info={info}
        />
      </div>
    </ErrorBoundary>
  );
}

export function _renderCrashDetails(props: CrashDetailsProps): React.ReactElement {
  return <CrashDetails {...props} />;
}
