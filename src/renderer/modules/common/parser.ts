import type SimpleMarkdown from "simple-markdown";
import { waitForProps } from "../webpack";

type DefaultRules = Pick<
  SimpleMarkdown.DefaultRules,
  | "newline"
  | "paragraph"
  | "escape"
  | "blockQuote"
  | "link"
  | "autolink"
  | "url"
  | "strong"
  | "em"
  | "u"
  | "br"
  | "text"
  | "inlineCode"
  | "codeBlock"
  | "heading"
  | "list"
  | "looseEm"
> & {
  emoticon: SimpleMarkdown.DefaultInRule;
  roleMention: SimpleMarkdown.DefaultInRule;
  mention: SimpleMarkdown.DefaultInRule;
  channelMention: SimpleMarkdown.DefaultInRule;
  channelOrMessageUrl: SimpleMarkdown.DefaultInRule;
  commandMention: SimpleMarkdown.DefaultInRule;
  emoji: SimpleMarkdown.DefaultInRule;
  customEmoji: SimpleMarkdown.DefaultInRule;
  timestamp: SimpleMarkdown.DefaultInRule;
  s: SimpleMarkdown.DefaultInRule;
  spoiler: SimpleMarkdown.DefaultInRule;
  staticRouteLink: SimpleMarkdown.DefaultInRule;
  highlight: SimpleMarkdown.DefaultInRule;
  guild: SimpleMarkdown.DefaultInRule;
  channel: SimpleMarkdown.DefaultInRule;
  message: SimpleMarkdown.DefaultInRule;
};

interface ParseOptions {
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

type ParseFn = (
  text?: string,
  inline?: boolean,
  opts?: ParseOptions,
  postProcess?: (tree: unknown, inline: boolean) => void,
) => React.ReactElement;

export interface Parser {
  defaultRules: DefaultRules;
  guildEventRules: Omit<DefaultRules, "codeBlock" | "blockQuote" | "br">;
  notifCenterV2MessagePreviewRules: Omit<
    DefaultRules,
    | "paragraph"
    | "newline"
    | "strong"
    | "codeBlock"
    | "inlineCode"
    | "u"
    | "link"
    | "url"
    | "autolink"
    | "list"
    | "heading"
  >;
  parse: ParseFn;
  parseAutoModerationSystemMessage: ParseFn;
  parseAutoModerationSystemMessageToAST: ParseFn;
  parseEmbedTitle: ParseFn;
  parseEmbedTitleToAST: ParseFn;
  parseForumPostGuidelines: ParseFn;
  parseForumPostMostRecentMessage: ParseFn;
  parseGuildEventDescription: ParseFn;
  parseGuildVerificationFormRule: ParseFn;
  parseInlineReply: ParseFn;
  parseInlineReplyToAST: ParseFn;
  parseToAST: ParseFn;
  parseTopic: ParseFn;
  parseTopicToAST: ParseFn;
  reactParserFor(rules: SimpleMarkdown.ParserRules): ParseFn;
  astParserFor(rules: SimpleMarkdown.ParserRules): ParseFn;
}

export default await waitForProps<Parser>("parse", "parseTopic");
