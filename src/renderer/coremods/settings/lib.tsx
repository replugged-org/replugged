import type { Section as SectionType, SettingsTools } from "../../../types/coremods/settings";
import type React from "react";

// todo: Create version of this for plugins that's limited to the plugin section and alphabetized

const getPos = (pos: number | undefined) => pos ?? -4;

export const Section = ({
  name,
  label,
  color,
  elem,
  pos,
}: {
  name?: string;
  label: string;
  color?: string;
  elem: React.FunctionComponent;
  pos?: number;
}): SectionType => ({
  section: name || `REPLUGGED_${label.toUpperCase()}`,
  label,
  color,
  element: elem,
  pos: getPos(pos),
});

export const Divider = (pos?: number): SectionType => ({
  section: "DIVIDER",
  pos: getPos(pos),
});

export const Header = (label: string, pos?: number): SectionType => ({
  section: "HEADER",
  label,
  pos: getPos(pos),
});

export const settingsTools: SettingsTools = {
  rpSections: [],
  rpSectionsAfter: {},
  addSection(opts) {
    // eslint-disable-next-line
    const data = Section(opts);

    settingsTools.rpSections.push(data);
    return data;
  },
  addAfter(sectionName, sections) {
    if (!Array.isArray(sections)) sections = [sections];
    settingsTools.rpSectionsAfter[sectionName] = sections;

    return sections;
  },
  removeAfter(sectionName) {
    delete settingsTools.rpSectionsAfter[sectionName];
  },
};

export function insertSections(sections: SectionType[]) {
  for (const section of settingsTools.rpSections) {
    sections.splice(section.pos < 0 ? sections.length + section.pos : section.pos, 0, section);
  }

  for (const sectionName in settingsTools.rpSectionsAfter) {
    const section = sections.findIndex((s) => s.section === sectionName);
    if (section === -1) continue;
    sections.splice(section + 1, 0, ...settingsTools.rpSectionsAfter[sectionName]);
  }

  return sections;
}
