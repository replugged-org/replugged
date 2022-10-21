import type { Section, SettingsTools } from "../../../types/coremods/settings";

// TODO(lexisother): Turn this into a utility that plugins can import (very
// important)

// signature
export const settingsTools: SettingsTools = {
  rpSections: [] as Section[],
  addSection({ name, label, color, elem, pos }) {
    const data: Section = {
      section: name || `REPLUGGED_${label.toUpperCase()}`,
      label,
      color,
      element: elem,
      pos: typeof pos === "undefined" ? -4 : pos,
    };

    settingsTools.rpSections.push(data);
    return data;
  },
  addDivider(pos) {
    settingsTools.rpSections.push({
      section: "DIVIDER",
      pos: typeof pos === "undefined" ? -4 : pos,
    });
  },
  addHeader(label, pos) {
    settingsTools.rpSections.push({
      section: "HEADER",
      label,
      pos: typeof pos === "undefined" ? -4 : pos,
    });
  },
};

export function insertSections(sections: Section[]) {
  for (const section of settingsTools.rpSections) {
    sections.splice(section.pos < 0 ? sections.length + section.pos : section.pos, 0, section);
  }
  return sections;
}
