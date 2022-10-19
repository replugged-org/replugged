// TODO(lleyton): Move these types to a proper location within the types folder
interface Section {
  section: string;
  label?: string;
  color?: string | null;
  element?: Function;
  pos: number;
}

// TODO(lexisother): Turn this into a utility that plugins can import (very
// important)
// TODO(lleyton): Write potentially better types or update the function
// signature
export const settingsTools = {
  rpSections: [] as Section[],
  addSection: function (
    name: string,
    label: string,
    color: string | null = null,
    elem: Function,
    pos: number | null = null
  ) {
    const data: Section = {
      section: name || `REPLUGGED_${label.toUpperCase()}`,
      label: label,
      color: color,
      element: elem,
      pos: pos === null ? -4 : pos,
    };

    settingsTools.rpSections.push(data);
    return data;
  },
  addDivider: function (pos: number | null = null) {
    settingsTools.rpSections.push({
      section: "DIVIDER",
      pos: pos === null ? -4 : pos,
    });
  },
  addHeader: function (label: string, pos: number | null = null) {
    settingsTools.rpSections.push({
      section: "HEADER",
      label: label,
      pos: pos === null ? -4 : pos,
    });
  },
};

export function insertSections(sections: Section[]) {
  for (const section of settingsTools.rpSections) {
    sections.splice(
      section.pos < 0 ? sections.length + section.pos : section.pos,
      0,
      section
    );
  }
  return sections;
}
