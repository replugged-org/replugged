import { filters, getBySource, waitForModule } from './webpack';
import { ModuleExports, Filter } from '@replugged';
import { error } from "./logger";
import type React from 'react';

async function wrapFilter<T extends React.ComponentType>(name: string, filter: Filter): Promise<T> {
  return (await waitForModule(filter, {
    timeout: 5_000,
  }).catch(() => {
    // eslint-disable-next-line no-undefined
    error("Replugged", "Components", undefined, `Could not find module ${name}`);
    return null;
  })) as T;
}

const SwitchItem = wrapFilter<React.ComponentType>(
  "SwitchItem",
  filters.bySource(/=.\.helpdeskArticleId,.=.\.children/),
);

export interface Components {
  SwitchItem: React.ComponentType
}

export default async (): Promise<Components> => ({
  SwitchItem: await SwitchItem
})
