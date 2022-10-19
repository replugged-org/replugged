// @ts-nocheck

// TODO(lexisother): Turn this into a utility that plugins can import (very important)
export const settingsTools = {
  rpSections: [],
  addSection: function (name, label, color = null, elem, pos = null) {
    const data = {};

    data.section = name || `REPLUGGED_${label.toUpperCase()}`;
    data.label = label;
    data.color = color;
    data.element = elem;
    data.pos = pos === null ? -4 : pos;

    settingsTools.rpSections.push(data);
    return data;
  },
  addDivider: function (pos = null) {
    settingsTools.rpSections.push({
      section: "DIVIDER",
      pos: pos === null ? -4 : pos,
    });
  },
  addHeader: function (label, pos = null) {
    settingsTools.rpSections.push({
      section: "HEADER",
      label: label,
      pos: pos === null ? -4 : pos,
    });
  },
};

export function insertSections(sections) {
  for (const section of settingsTools.rpSections) {
    sections.splice(
      section.pos < 0 ? sections.length + section.pos : section.pos,
      0,
      section
    );
  }
  return sections;
}
