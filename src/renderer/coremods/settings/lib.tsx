import type React from "react";
import type {
  LabelCallback,
  Section as SectionType,
  SettingsTools,
} from "../../../types/coremods/settings";
import { filters, getFunctionBySource, waitForModule } from "@webpack";

export const getQuery = await waitForModule(
  filters.bySource('query:"",isActive:!1,selected:null'),
).then((c) => getFunctionBySource<() => string>(c, '.useField("query")')!);

const getPos = (pos: number | undefined): number => pos ?? -4;

export const Section = ({
  name,
  _id,
  label,
  color,
  elem,
  pos,
  fromEnd,
  tabPredicate,
}: {
  name: string;
  _id?: string;
  label?: string | LabelCallback;
  color?: string;
  elem: (args: unknown) => React.ReactElement;
  pos?: number;
  fromEnd?: boolean;
  tabPredicate?: (query: string) => boolean;
}): SectionType => ({
  section: name,
  _id,
  label,
  color,
  element: elem,
  pos: getPos(pos),
  className: `rp-settingsItem ${name}`,
  fromEnd: fromEnd ?? getPos(pos) < 0,
  tabPredicate: tabPredicate && (() => tabPredicate(getQuery())),
});

export const Divider = (pos?: number): SectionType => ({
  section: "DIVIDER",
  pos: getPos(pos),
  tabPredicate: () => !getQuery(),
});

export const Header = (label: string | LabelCallback, pos?: number): SectionType => ({
  section: "HEADER",
  label,
  pos: getPos(pos),
  tabPredicate: () => !getQuery(),
});

export const settingsTools: SettingsTools = {
  rpSections: [],
  rpSectionsAfter: new Map(),
  addSection(opts) {
    const data = Section(opts);

    settingsTools.rpSections.push(data);
    return data;
  },
  removeSection(sectionName) {
    settingsTools.rpSections = settingsTools.rpSections.filter(
      (s) => s.section !== sectionName && s._id !== sectionName,
    );
  },
  addAfter(sectionName, sections) {
    if (!Array.isArray(sections)) sections = [sections];
    settingsTools.rpSectionsAfter.set(sectionName, sections);

    return sections;
  },
  removeAfter(sectionName) {
    settingsTools.rpSectionsAfter.delete(sectionName);
  },
};

export function insertSections(sections: SectionType[]): SectionType[] {
  for (const section of settingsTools.rpSections) {
    sections.splice(section.fromEnd ? sections.length + section.pos : section.pos, 0, section);
  }

  for (const sectionName of settingsTools.rpSectionsAfter.keys()) {
    const section = sections.findIndex((s) => s.section === sectionName);
    if (section === -1) continue;

    for (const section of settingsTools.rpSectionsAfter.get(sectionName)!) {
      const labelFn = section.__$$label;

      if (typeof section.label === "function" || typeof labelFn === "function") {
        if (!labelFn) {
          section.__$$label = section.label as LabelCallback;
        }

        section.label = section.__$$label?.();
      }
    }

    sections.splice(section + 1, 0, ...settingsTools.rpSectionsAfter.get(sectionName)!);
  }

  return sections;
}
