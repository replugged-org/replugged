import type React from "react";
import type {
  LabelCallback,
  SectionRecords,
  Section as SectionType,
  SettingsTools,
} from "../../../types/coremods/settings";

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
  searchableTitles
}: {
  name: string;
  _id?: string;
  label?: string | LabelCallback;
  color?: string;
  elem: (args: unknown) => React.ReactElement;
  pos?: number;
  fromEnd?: boolean;
  tabPredicate?: () => boolean;
   searchableTitles?: string[];
}): SectionType => ({
  section: name,
  _id,
  label,
  color,
  element: elem,
  pos: getPos(pos),
  className: `rp-settingsItem ${name}`,
  fromEnd: fromEnd ?? getPos(pos) < 0,
  tabPredicate,
  searchableTitles
});

export const settingsTools: SettingsTools = {
  sections: new Map(),
  rpSections: new Map(),
  rpSectionsAfter: new Map(),
  addSection(opts) {
    const data = Section(opts);
    const name = data._id || data.section;
    const labelFn = data.__$$label;
    if (typeof data.label === "function" || typeof labelFn === "function") {
      if (!labelFn) {
        data.__$$label = data.label as LabelCallback;
      }
      data.label = data.__$$label?.();
    }
    settingsTools.rpSections.set(name, data);
    return data;
  },
  removeSection(sectionName) {
    settingsTools.rpSections.delete(sectionName);
  },

  addAfter(sectionName, section) {
    const record = {
      header: section.header,
      divider: section.divider,
      settings: section.settings?.map((section) => {
        const name = section._id || section.section;
        const labelFn = section.__$$label;
        if (typeof section.label === "function" || typeof labelFn === "function") {
          if (!labelFn) {
            section.__$$label = section.label as LabelCallback;
          }
          section.label = section.__$$label?.();
        }
        settingsTools.sections.set(name, section);
        return name;
      }),
    };
    settingsTools.rpSectionsAfter.set(sectionName, record);
    return section;
  },
  removeAfter(sectionName) {
    settingsTools.sections.delete(sectionName);
    settingsTools.rpSectionsAfter.delete(sectionName);
  },
};

export function insertSections<T = Record<string, SectionType>>(sections: T): T {
  return {
    ...sections,
    ...Object.fromEntries(settingsTools.sections),
    ...Object.fromEntries(settingsTools.rpSections),
  };
}

export function insertRecords(records: SectionRecords[]): SectionRecords[] {
  for (const sectionName of settingsTools.rpSections.keys()) {
    const section = settingsTools.rpSections.get(sectionName)!;
    const lengths = records.reduce(
      (acc: number[], curr, index) => [
        ...acc,
        (acc[index - 1] || 0) + (curr.settings?.length || 0),
      ],
      [],
    );
    const recordIndex = lengths.findIndex(
      (c) => (section.fromEnd ? lengths.at(-1)! - 1 + section.pos : section.pos) < c - 1,
    );
    if (recordIndex === -1) continue;
    records[recordIndex].settings!.splice(
      (section.fromEnd ? lengths.at(-1)! + section.pos : section.pos) -
        (lengths[recordIndex - 1] || 0) +
        1,
      0,
      sectionName,
    );
  }

  for (const sectionName of settingsTools.rpSectionsAfter.keys()) {
    const recordIndex = records.findIndex((r) => r.settings?.includes(sectionName));
    if (recordIndex === -1) continue;
    const sectionRecord = records[recordIndex];
    if (!sectionRecord.settings) continue;
    if (sectionRecord.settings.at(-1) === sectionName) {
      records.splice(recordIndex + 1, 0, settingsTools.rpSectionsAfter.get(sectionName)!);
      continue;
    }
    const sectionIndex = sectionRecord.settings.findIndex((s) => s === sectionName);
    const afterSettings = sectionRecord.settings.splice(
      sectionIndex,
      sectionRecord.settings.length,
    );
    records.splice(recordIndex + 1, 0, settingsTools.rpSectionsAfter.get(sectionName)!, {
      settings: afterSettings,
    });
  }
  return records;
}
