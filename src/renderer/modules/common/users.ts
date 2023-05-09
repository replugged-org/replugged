import { waitForProps } from "../webpack";
import type { GuildMember, User } from "discord-types/general";
import { virtualMerge } from "src/renderer/util";

interface PendingRoleUpdate {
  added: Record<string, string[]>;
  removed: Record<string, string[]>;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type UserStore = {
  filter: (callback: (user: User) => User | boolean, sort?: boolean) => User[];
  findByTag: (username: string, discriminator?: string) => User | undefined;
  forEach: (callback: (user: User) => void) => void;
  getCurrentUser: () => User;
  getUser: (userId: string) => User | undefined;
  getUsers: () => Record<string, User>;
  getUserStoreVersion: () => number;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type GuildMemberStore = {
  getCommunicationDisabledUserMap: () => Record<string, string>;
  getCommunicationDisabledVersion: () => number;
  getMember: (guildId: string, userId: string) => GuildMember | null;
  getMemberIds: (guildId?: string) => string[];
  getMemberRoleWithPendingUpdates: (guildId: string, userId: string) => string[];
  getMembers: (guildId?: string) => GuildMember[];
  getMutableAllGuildsAndMembers: () => Record<string, Record<string, GuildMember>>;
  getNick: (guildId?: string, userId?: string) => string | null;
  getNicknameGuildsMapping: (userId: string) => Record<string, string[]>;
  getNicknames: (userId: string) => string[];
  getPendingRoleUpdates: (guildId: string) => PendingRoleUpdate;
  getSelfMember: (guildId: string) => GuildMember | null;
  getTrueMember: (guildId: string, userId: string) => GuildMember | null;
  isCurrentUserGuest: (guildId?: string) => boolean;
  isGuestOrLurker: (guildId?: string, userId?: string) => boolean;
  isMember: (guildId?: string, userId?: string) => boolean;
  memberOf: (userId: string) => string[];
};

export type Users = UserStore & GuildMemberStore;

export default virtualMerge(
  await waitForProps<keyof UserStore, UserStore>(["getUser", "getCurrentUser"]).then(
    Object.getPrototypeOf,
  ),
  await waitForProps<keyof GuildMemberStore, GuildMemberStore>(["getTrueMember", "getMember"]).then(
    Object.getPrototypeOf,
  ),
);
