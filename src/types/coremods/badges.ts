/* eslint-disable @typescript-eslint/naming-convention */

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
  public guildId?: string;
  public banner: string | undefined;
  public bio: string;
  public pronouns: string;
  public accentColor: number | null;
  public themeColors: number[] | undefined;
  public popoutAnimationParticleType: string | null | undefined;
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
