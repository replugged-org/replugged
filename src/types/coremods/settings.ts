import type React from "react";

export type LabelCallback = () => string;

export interface Section {
  section: string;
  _id?: string;
  label?: string | LabelCallback;
  color?: string;
  element?: React.FC;
  tabPredicate?: () => boolean;
  pos: number;
  fromEnd?: boolean;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __$$label?: LabelCallback;
}

export interface SettingsTools {
  rpSections: Section[];
  rpSectionsAfter: Map<string, Section[]>;
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
  addAfter: (sectionName: string, sections: Section | Section[]) => Section[];
  removeAfter: (sectionName: string) => void;
}

interface UserSettingsFormProps {
  title?: React.ReactNode;
  className?: string;
}

export type UserSettingsFormType = React.FC<React.PropsWithChildren<UserSettingsFormProps>>;
