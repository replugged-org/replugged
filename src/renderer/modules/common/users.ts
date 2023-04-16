import { waitForProps } from "../webpack";
import type { GuildMember, User } from "discord-types/general";
import { virtualMerge } from "src/renderer/util";

export interface PendingRoleUpdate {
  added: Record<string, string[]>;
  removed: Record<string, string[]>;
}

export interface UserStore {
  filter: (predicate: (user: User) => User | boolean, sort?: boolean) => User[];
  findByTag: (username?: string, discriminator?: string) => User | undefined;
  forEach: (callback: (user: User) => unknown) => void;
  getCurrentUser: () => User;
  getUser: (userId?: string) => User | undefined;
  getUsers: () => Record<string, User>;
  getUserStoreVersion: () => number;
}

export interface GuildMemberStore {
  getCommunicationDisabledUserMap: () => Record<string, string>;
  getCommunicationDisabledVersion: () => number;
  getMember: (guildId?: string, userId?: string) => GuildMember | undefined;
  getMemberIds: (guildId?: string) => string[];
  getMemberRoleWithPendingUpdates: (guildId?: string, userId?: string) => string[];
  getMembers: (guildId?: string) => GuildMember[];
  getMutableAllGuildsAndMembers: () => Record<string, Record<string, GuildMember>>;
  getNick: (guildId?: string, userId?: string) => string | undefined;
  getNicknameGuildsMapping: (userId?: string) => Record<string, string[]>;
  getNicknames: (userId?: string) => string[];
  getSelfMember: (guildId?: string) => GuildMember | undefined;
  getTrueMember: (guildId?: string, userId?: string) => GuildMember | undefined;
  getPendingRoleUpdates: (guildId?: string) => PendingRoleUpdate;
  isMember: (guildId?: string, userId?: string) => boolean;
  memberOf: (userId?: string) => string[];
}

export type Users = UserStore & GuildMemberStore;

export default virtualMerge(
  (await waitForProps<UserStore>("getUser", "getCurrentUser").then(
    Object.getPrototypeOf,
  )) as UserStore,
  (await waitForProps<GuildMemberStore>("getTrueMember", "getMember").then(
    Object.getPrototypeOf,
  )) as GuildMemberStore,
);
