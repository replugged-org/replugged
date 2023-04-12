import { waitForProps } from "../webpack";
import type { GuildMember, User } from "discord-types/general";
import { virtualMerge } from "src/renderer/util";

export interface PendingRoleUpdate {
  added: Record<string, string[]>;
  removed: Record<string, string[]>;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type UserStore = {
  filter: (predicate: (user: User) => User | boolean, sort?: boolean) => User[];
  findByTag: (username?: string, discriminator?: string) => User | undefined;
  forEach: (callback: (user: User) => unknown) => void;
  getCurrentUser: () => User;
  getUser: (userId?: string) => User | undefined;
  getUsers: () => Record<string, User>;
  getUserStoreVersion: () => number;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type GuildMemberStore = {
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
};

export type Users = UserStore & GuildMemberStore;

export default virtualMerge(
  (await waitForProps(["getUser", "getCurrentUser"]).then(Object.getPrototypeOf)) as UserStore,
  (await waitForProps(["getTrueMember", "getMember"]).then(
    Object.getPrototypeOf,
  )) as GuildMemberStore,
);
