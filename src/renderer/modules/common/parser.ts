import { RawModule } from "../../../types";
import { filters, waitForModule } from "../webpack";

interface State {
  prevCapture: RegExpExecArray | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Rule<T = any> {
  order: number;
  match: (source: string, state: State) => RegExpExecArray | null;
  parse: (match: RegExpExecArray) => T;
  react: (props: T) => React.ReactElement;
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
}

type ParseFn = (text: string, unknown?: boolean, opts?: ParseOpts) => React.ReactElement;

export interface Parser {
  parse: ParseFn;
  parseTopic: ParseFn;
  parseEmbedTitle: ParseFn;
  parseInlineReply: ParseFn;
  parseGuildVerificationFormRule: ParseFn;
  parseGuildEventDescription: ParseFn;
  parseAutoModerationSystemMessage: ParseFn;
  parseForumPostGuidelines: ParseFn;
  reactParserFor(rules: Record<string, Rule>): ParseFn;
  defaultRules: Record<string, Rule>;
}
export default await waitForModule<RawModule & Parser>(filters.byProps("parse", "parseTopic"));
