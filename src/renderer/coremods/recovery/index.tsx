import { fluxDispatcher, parser, toast } from "@common";
import { Button } from "@components";
import { Injector, Logger } from "@replugged";
import { filters, getByProps, waitForModule } from "@webpack";
import "./styles.css";
import { AnyFunction } from "../../../types";

import { generalSettings } from "../settings/pages";
import { disable } from "../../managers/plugins";
const injector = new Injector();

// const URL_REGEX_FIND = /https:\/\/\S+/g;
const PLUGIN_ID_FIND_REGEX = /plugin\/(.*?)\.asar/;
const FIND_ERROR_NUMBER = /invariant=(\d+)&/;
const ReactErrorList =
  "https://raw.githubusercontent.com/facebook/react/17.0.2/scripts/error-codes/codes.json";
const logger = Logger.coremod("recovery");
let ReactErrors: Record<string, string> | undefined;

interface ErrorComponentState {
  error: {
    message: string;
    stack: string;
  } | null;
  info: null;
}

interface ErrorScreenInstance {
  state?: ErrorComponentState;
  setState: (state: ErrorComponentState) => void;
}

interface Modals {
  closeAllModals: AnyFunction;
}

interface RouteInstance {
  transitionTo: (location: string) => void;
}

const ModalModule: Modals | undefined = getByProps("openModalLazy");
const RouteModule: RouteInstance | undefined = getByProps("transitionTo");

function startMainRecovery(): void {
  const log = (reason: string): void => logger.log(reason),
    err = (reason: string): void => logger.error(reason);
  log("Starting main recovery methods.");
  if (!ModalModule) {
    err("Could not find `openModalLazy` Module.");
    return;
  }

  try {
    // I think trying to transition first is a better move.
    // Considering most errors come from patching.
    RouteModule?.transitionTo("/channels/@me");
  } catch {
    err("Failed to transition to '/channels/@me'.");
  }

  try {
    fluxDispatcher.dispatch({ type: "CONTEXT_MENU_CLOSE" });
  } catch {
    err("ContextMenu's could not be closed.");
  }

  try {
    ModalModule.closeAllModals();
  } catch {
    err("Could not close (most) modals.");
  }

  log("Ended main recovery.");
}

export async function start(): Promise<void> {
  const ErrorScreen = await waitForModule<AnyFunction>(
    filters.bySource(".AnalyticEvents.APP_CRASHED"),
  );
  void startErrors();
  injector.after(
    ErrorScreen.prototype,
    "render",
    (_args, res: React.ReactElement, instance: ErrorScreenInstance): void => {
      if (generalSettings.get("automaticRecover")) {
        startMainRecovery();
        instance.setState({ error: null, info: null });
      }
      const children = res.props?.action?.props?.children;
      if (!children || !instance.state?.error) return;
      const stackError = instance.state.error.stack;
      // I don't think this would fail..?
      const pluginId = stackError.match(PLUGIN_ID_FIND_REGEX);
      if (pluginId) {
        void disable(pluginId[1]);
        toast.toast(`Plugin: ${pluginId[1]} was disabled!`, toast.Kind.SUCCESS);
      }
      // const Link = instance.state.error.stack.match(URL_REGEX_FIND);
      // this'll be used once I make a react decoder for errors. >:(
      // never mind this idea is better.

      const invar = stackError.match(FIND_ERROR_NUMBER);

      children.push(
        <>
          <Button
            className={`recovery-button`}
            onClick={() => {
              startMainRecovery();
              instance.setState({ error: null, info: null });
            }}>
            Recover Discord
          </Button>
          <div className={"recovery-parse"}>
            {parser.parse(`\`\`\`${invar ? ReactErrors?.[invar[1]] : ""}\n\n${stackError}\`\`\``)}
          </div>
        </>,
      );
    },
  );
}

export function stop(): void {
  injector.uninjectAll();
}

export async function startErrors(): Promise<void> {
  ReactErrors = await fetch(ReactErrorList).then((response) => response.json());
}
