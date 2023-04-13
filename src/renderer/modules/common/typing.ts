import { waitForProps } from "../webpack";

export interface Typing {
  startTyping: (channelId: string) => void;
  stopTyping: (channelId: string) => void;
}

export default await waitForProps<Typing>("startTyping", "stopTyping");
