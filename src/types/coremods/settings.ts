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
  rpSectionsAfter: Record<string, Section[]>;
  addSection: (options: {
    name: string;
    label: string;
    color?: string;
    elem: FC;
    pos?: number;
  }) => Section;
  addAfter: (sectionName: string, sections: Section | Section[]) => Section[];
  removeAfter: (sectionName: string) => void;
}
