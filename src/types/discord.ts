export enum ApplicationCommandOptionType {
  //Subcommand = 1,
  //SubcommandGroup = 2,
  String = 3,
  Integer = 4,
  Boolean = 5,
  User = 6,
  Channel = 7,
  Role = 8,
  Mentionable = 9,
  Number = 10,
  Attachment = 11,
}

interface BaseCommandOptions<T extends ApplicationCommandOptionType> {
  type: T;
  name: string;
  displayName?: string;
  description: string;
  displayDescription?: string;
  serverLocalizedName?: string;
  required?: boolean;
}

export interface CommandChoices {
  name: string;
  displayName: string;
  value: string | number;
}

export interface CommandOptionAutocompleteAndChoices {
  autocomplete?: boolean;
  choices?: readonly CommandChoices[];
  focused?: boolean;
}

export interface StringOptions
  extends CommandOptionAutocompleteAndChoices,
    BaseCommandOptions<ApplicationCommandOptionType.String> {
  /* eslint-disable @typescript-eslint/naming-convention */
  min_length?: number;
  max_length?: number;
  /* eslint-enable @typescript-eslint/naming-convention */
}

export interface NumberOptions
  extends CommandOptionAutocompleteAndChoices,
    BaseCommandOptions<ApplicationCommandOptionType.Integer | ApplicationCommandOptionType.Number> {
  /* eslint-disable @typescript-eslint/naming-convention */
  min_value?: number;
  max_value?: number;
  /* eslint-enable @typescript-eslint/naming-convention */
}

export interface ChannelOptions extends BaseCommandOptions<ApplicationCommandOptionType.Channel> {
  /* eslint-disable @typescript-eslint/naming-convention */
  channel_types?: readonly number[];
}

export type OtherCommandOptions = BaseCommandOptions<
  | ApplicationCommandOptionType.Attachment
  | ApplicationCommandOptionType.Boolean
  | ApplicationCommandOptionType.Mentionable
  | ApplicationCommandOptionType.Role
  | ApplicationCommandOptionType.User
>;

export interface CommandOptionReturn<T = unknown> {
  name: string;
  type: ApplicationCommandOptionType;
  value: T;
}

export type CommandOptions = StringOptions | NumberOptions | ChannelOptions | OtherCommandOptions;

export enum MessageEmbedTypes {
  IMAGE = "image",
  VIDEO = "video",
  LINK = "link",
  ARTICLE = "article",
  TWEET = "tweet",
  RICH = "rich",
  GIFV = "gifv",
  APPLICATION_NEWS = "application_news",
  AUTO_MODERATION_MESSAGE = "auto_moderation_message",
  AUTO_MODERATION_NOTIFICATION = "auto_moderation_notification",
  TEXT = "text",
  POST_PREVIEW = "post_preview",
  GIFT = "gift",
  SAFETY_POLICY_NOTICE = "safety_policy_notice",
  SAFETY_SYSTEM_NOTIFICATION = "safety_system_notification",
  VOICE_CHANNEL = "voice_channel",
  GAMING_PROFILE = "gaming_profile",
}

export interface APIEmbed {
  title?: string;
  type?: MessageEmbedTypes;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: {
    text: string;
    icon_url?: string;
    proxy_icon_url?: string;
  };
  image?: {
    url: string;
    proxy_url?: string;
    height: number;
    width: number;
  };
  thumbnail?: {
    url: string;
    proxy_url?: string;
    width: number;
    height: number;
  };
  video?: {
    url?: string;
    proxy_url?: string;
    height: number;
    width: number;
  };
  provider?: {
    name?: string;
    url?: string;
  };
  author?: {
    name: string;
    url?: string;
    icon_url?: string;
    proxy_icon_url?: string;
  };
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
}

interface ApplicationRoleConnection {
  platform_name: string | null;
  platform_username: string | null;
  metadata: Record<string, number | string>;
}

interface ConnectedAccount {
  type: string;
  name: string;
  id: string;
  verified: boolean;
}

export interface Badge {
  id: string;
  description: string;
  icon: string;
  link?: string;
}

interface ApplicationInstallParams {
  scopes: string[];
  permissions: string;
}

interface ApplicationIntegrationTypeConfig {
  oauth2_install_params?: ApplicationInstallParams;
}

interface ProfileApplication {
  id: string;
  primarySkuId: string | undefined;
  customInstallUrl: string | undefined;
  installParams: ApplicationInstallParams | undefined;
  integrationTypesConfig: Record<number, ApplicationIntegrationTypeConfig> | undefined;
  flags: number;
  popularApplicationCommandIds: string[] | undefined;
  storefront_available: boolean;
}

interface UserProfile {
  userId: string;
  banner: string | null | undefined;
  accentColor: number | null | undefined;
  themeColors: number[] | null | undefined;
  popoutAnimationParticleType: string | null | undefined;
  bio: string;
  profileEffectId: string | undefined;
  pronouns: string;
  connectedAccounts: ConnectedAccount[];
  applicationRoleConnections: ApplicationRoleConnection[];
  premiumSince: Date | null;
  premiumType: number | null;
  premiumGuildSince: Date | null;
  lastFetched: number;
  legacyUsername: string | undefined;
  profileFetchFailed: boolean;
  application: ProfileApplication | null;
  badges: Badge[];
}

type GuildMemberProfile = Pick<
  UserProfile,
  | "userId"
  | "banner"
  | "accentColor"
  | "themeColors"
  | "popoutAnimationParticleType"
  | "profileEffectId"
  | "bio"
  | "pronouns"
  | "badges"
> & { guildId: string };

interface BannerURLOptions {
  canAnimate: boolean;
  size: number;
}

interface PreviewBio {
  value: string;
  isUsingGuildValue: boolean;
}

export declare class DisplayProfile {
  public constructor(userProfile: UserProfile, guildMemberProfile?: GuildMemberProfile);

  public userId: string;
  public guildId: string | undefined;
  public banner: string | undefined;
  public bio: string;
  public pronouns: string;
  public accentColor: number | null;
  public themeColors: number[] | undefined;
  public popoutAnimationParticleType: string | null | undefined;
  public profileEffectId: string | undefined;
  private _userProfile: UserProfile;
  private _guildMemberProfile: GuildMemberProfile;

  public get premiumSince(): Date | null;
  public get premiumGuildSince(): Date | null;
  public get premiumType(): number;
  public get primaryColor(): number;
  public get canUsePremiumProfileCustomization(): boolean;
  public get canEditThemes(): boolean;
  public get application(): ProfileApplication | null;

  public hasThemeColors: () => boolean;
  public hasPremiumCustomization: () => boolean;
  public hasFullProfile: () => boolean;
  public isUsingGuildMemberBanner: () => boolean;
  public isUsingGuildMemberBio: () => boolean;
  public isUsingGuildMemberPronouns: () => boolean;
  public getBannerURL: (options: BannerURLOptions) => string;
  public getPreviewBanner: (
    banner: string | null,
    canAnimate: boolean,
    size?: number,
  ) => string | null | undefined;
  public getPreviewBio: (bio?: string) => PreviewBio;
  public getPreviewThemeColors: (colors?: number[]) => number[] | undefined;
  public getBadges: () => Badge[];
  public getLegacyUsername: () => string | undefined;
}
