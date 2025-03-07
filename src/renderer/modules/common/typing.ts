import { waitForProps } from "../webpack";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type Typing = {
  startTyping: (channelId: string) => void;
  stopTyping: (channelId: string) => void;
};

export default waitForProps<Typing>("startTyping", "stopTyping");
