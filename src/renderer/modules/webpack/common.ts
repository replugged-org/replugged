import { getByProps, getBySource, getModule } from ".";
import { ModuleExports } from "../../../types/discord";
import { Filter } from "../../../types/webpack";

import type React from "react";
import type Electron from "electron";

enum CommonModuleFilterTypes {
  PROPS,
  SOURCE,
  FUNCTION,
}

interface CommonModulePropsFilter {
  type: CommonModuleFilterTypes.PROPS;
  props: string[];
}

interface CommonModuleSourceFilter {
  type: CommonModuleFilterTypes.SOURCE;
  match: string | RegExp;
}

interface CommonModuleFunctionFilter {
  type: CommonModuleFilterTypes.FUNCTION;
  filter: Filter;
}

type CommonModuleFilter =
  | CommonModulePropsFilter
  | CommonModuleSourceFilter
  | CommonModuleFunctionFilter;

const commonModules = new Map<string, ModuleExports | undefined>();

function findCommonModule(filter: CommonModuleFilter): ModuleExports | undefined {
  switch (filter.type) {
    case CommonModuleFilterTypes.PROPS:
      return getByProps(...filter.props);
    case CommonModuleFilterTypes.SOURCE:
      return getBySource(filter.match);
    case CommonModuleFilterTypes.FUNCTION:
      return getModule(filter.filter);
  }
}

function getCommonModule(name: string, filter: CommonModuleFilter): ModuleExports | undefined {
  if (!commonModules.has(name)) {
    const found = findCommonModule(filter);
    if (found !== void 0) {
      commonModules.set(name, found);
    }
  }
  return commonModules.get(name);
}

export default {
  get React(): typeof React {
    return getCommonModule("React", {
      type: CommonModuleFilterTypes.PROPS,
      props: ["__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED", "createElement"],
    }) as typeof React;
  },
  get app(): Electron.App {
    return window.DiscordNative.app as Electron.App;
  },
};
