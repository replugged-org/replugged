import type { FC } from "react";

export type LabelCallback = () => string;

export interface Section {
  section: string;
  label?: string | LabelCallback;
  color?: string;
  element?: FC;
  pos: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __$$label?: LabelCallback;
}

export interface SettingsTools {
  rpSections: Section[];
  rpSectionsAfter: Map<string, Section[]>;
  addSection: (options: {
    name: string;
    label: string | LabelCallback;
    color?: string;
    elem: FC;
    pos?: number;
  }) => Section;
  addAfter: (sectionName: string, sections: Section | Section[]) => Section[];
  removeAfter: (sectionName: string) => void;
}
