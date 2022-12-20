import { ModuleExports } from "../../../../types";
import { filters, waitForModule } from "..";

export type Typing = ModuleExports & {
  startTyping: (channelId: string) => void;
  stopTyping: (channelId: string) => void;
};

const typing: Typing = await waitForModule(filters.byProps("startTyping", "stopTyping"));

export default typing;
