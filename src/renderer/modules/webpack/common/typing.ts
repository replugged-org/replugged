import { RawModule } from "../../../../types";
import { filters, waitForModule } from "..";

export interface Typing {
  startTyping: (channelId: string) => void;
  stopTyping: (channelId: string) => void;
}

const typing: Typing = await waitForModule<RawModule & Typing>(
  filters.byProps("startTyping", "stopTyping"),
);

export default typing;
