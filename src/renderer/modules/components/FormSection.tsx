import { filters, waitForModule } from "@webpack";

import type * as Design from "discord-client-types/discord_app/design/web";

const formSectionStr = ".sectionTitle,";
const FormSection = await waitForModule<Record<string, Design.FormSection>>(
  filters.bySource(formSectionStr),
).then((mod) => Object.values(mod).find((x) => x?.render?.toString()?.includes(formSectionStr))!);

export default FormSection;
