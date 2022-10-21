import type { FC } from "react";

export interface Section {
  section: string;
  label?: string;
  color?: string;
  element?: FC;
  pos: number;
}

export interface SettingsTools {
  rpSections: Section[];
  addSection: (options: {
    name: string;
    label: string;
    color?: string;
    elem: FC;
    pos?: number;
  }) => Section;
  addDivider: (pos?: number) => void;
  addHeader: (label: string, pos?: number) => void;
}
