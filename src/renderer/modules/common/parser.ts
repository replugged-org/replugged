import { waitForProps } from "../webpack";

interface State {
  prevCapture: RegExpExecArray | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Rule<T = any> {
  order: number;
  match: (source: string, state: State) => RegExpExecArray | null;
  parse: (match: RegExpExecArray) => T;
  react: (props: T, ...rest: unknown[]) => React.ReactElement;
}

interface ParseOpts {
  allowLinks?: boolean;
  channelId?: string;
  mentionChannels?: string[];
  isInteracting?: boolean;
  formatInline?: boolean;
  noStyleAndInteraction?: boolean;
  allowHeading?: boolean;
  allowList?: boolean;
  previewLinkTarget?: boolean;
  disableAnimatedEmoji?: boolean;
  disableAutoBlockNewlines?: boolean;
  highlightWord?: string;
  returnMentionIds?: boolean;
}

type ParseFn = (text: string, inline?: boolean, opts?: ParseOpts) => React.ReactElement;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type Parser = {
  parse: ParseFn;
  parseTopic: ParseFn;
  parseEmbedTitle: ParseFn;
  parseInlineReply: ParseFn;
  parseGuildVerificationFormRule: ParseFn;
  parseGuildEventDescription: ParseFn;
  parseAutoModerationSystemMessage: ParseFn;
  parseForumPostGuidelines: ParseFn;
  parseForumPostMostRecentMessage: ParseFn;
  reactParserFor(rules: Record<string, Rule>): ParseFn;
  defaultRules: Record<string, Rule>;
};

const props = ["parse", "parseTopic"];

export default await waitForProps<(typeof props)[number], Parser>(props);
