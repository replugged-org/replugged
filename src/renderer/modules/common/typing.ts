import type { RawModule } from "../../../types";
import { filters, waitForModule } from "../webpack";

export interface Typing {
  startTyping: (channelId: string) => void;
  stopTyping: (channelId: string) => void;
}

export default await waitForModule<RawModule & Typing>(
  filters.byProps("startTyping", "stopTyping"),
);
