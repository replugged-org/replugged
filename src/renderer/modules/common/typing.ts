import { waitForProps } from "../webpack";

export interface TypingActionCreators {
  startTyping: (channelId: string) => void;
  stopTyping: (channelId: string) => void;
}

export default await waitForProps<TypingActionCreators>("startTyping", "stopTyping");
