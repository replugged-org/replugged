import type React from "react";

export type LabelCallback = () => string;

export type SearchableCallback = () => string[];

export interface Section {
  section: string;
  _id?: string;
  label?: string | LabelCallback;
  color?: string;
  element?: React.FC;
  pos: number;
  fromEnd?: boolean;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __$$label?: LabelCallback;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __$$searchable?: SearchableCallback;
  tabPredicate?: () => boolean;
  searchableTitles?: string[] | SearchableCallback;
}

interface SettingRecord {
  divider?: boolean;
  header?: string;
  settings?: Section[];
}

export interface SectionRecords {
  divider?: boolean;
  header?: string;
  settings?: string[];
}

export interface SettingsTools {
  sections: Map<string, Section>;
  rpSections: Map<string, Section>;
  rpSectionsAfter: Map<string, SectionRecords>;
  addSection: (options: {
    name: string;
    _id?: string;
    label?: string | LabelCallback;
    color?: string;
    elem: (args: unknown) => React.ReactElement;
    pos?: number;
    fromEnd?: boolean;
  }) => Section;
  removeSection: (sectionName: string) => void;
  addAfter: (sectionName: string, sections: SettingRecord) => SettingRecord;
  removeAfter: (sectionName: string) => void;
}
