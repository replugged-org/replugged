import { filters, getExportsForProps, waitForModule } from "../webpack";
import type { GuildMember, User } from "discord-types/general";
import { virtualMerge } from "src/renderer/util";

export interface UserCommunicationDisabled {
  communicationDisabledUntil: number | undefined;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type UsersStore = {
  // User Store
  filter: (predicate: (user: User) => User | boolean, sort?: boolean) => User[];
  findByTag: (username?: string, discriminator?: string) => User | undefined;
  forEach: (callback: (user: User) => unknown) => void;
  getCurrentUser: () => User;
  getUser: (userId?: string) => User | undefined;
  getUsers: () => Record<string, User>;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type GuildMemberStore = {
  // Guild Member Store
  getCommunicationDisabledUserMap: () => Record<string, UserCommunicationDisabled>;
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
  getPendingRoleUpdates: (guildId?: string) => {
    added: Record<string, string[]>;
    removed: Record<string, string[]>;
  };
  isMember: (guildId?: string, userId?: string) => boolean;
  memberOf: (userId?: string) => string[];
};

export type Users = UsersStore & GuildMemberStore;

export default virtualMerge(
  (await waitForModule(filters.byProps("getUser", "getCurrentUser")).then(
    Object.getPrototypeOf,
  )) as UsersStore,
  (await waitForModule(filters.byProps("getTrueMember", "getMember")).then((mod) =>
    Object.getPrototypeOf(getExportsForProps(mod, ["getTrueMember", "getMember"])),
  )) as GuildMemberStore,
);
