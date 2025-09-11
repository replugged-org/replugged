import type { Channel, GuildMember, User } from "discord-types/general";
import { virtualMerge } from "src/renderer/util";
import { waitForStore } from "../webpack";
import type { Store } from "./flux";

interface PendingRoleUpdate {
  added: Record<string, string[]>;
  removed: Record<string, string[]>;
}

interface Cache {
  initialGuildChannels: Channel[];
  privateChannels: Channel[];
  users?: User[];
}

interface Snapshot {
  data: {
    users: User[];
  };
  version: number;
}

export interface UserStore {
  filter: (callback: (user: User) => User | boolean, sort?: boolean) => User[];
  findByTag: (username: string, discriminator?: string) => User | undefined;
  forEach: (callback: (user: User) => void) => void;
  getCurrentUser: () => User;
  getUser: (userId: string) => User | undefined;
  getUsers: () => Record<string, User>;
  getUserStoreVersion: () => number;
  handleLoadCache: (cache: Cache) => void;
  takeSnapshot: () => Snapshot;
}

export interface GuildMemberStore {
  getCachedSelfMember: (guildId: string) => GuildMember | null;
  getCommunicationDisabledUserMap: () => Record<string, string>;
  getCommunicationDisabledVersion: () => number;
  getMember: (guildId: string, userId: string) => GuildMember | null;
  getMemberIds: (guildId?: string) => string[];
  getMemberRoleWithPendingUpdates: (guildId: string, userId: string) => string[];
  getMembers: (guildId?: string) => GuildMember[];
  getMemberVersion: () => number;
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
}

const UserStore = await waitForStore<UserStore & Store>("UserStore");
const GuildMemberStore = await waitForStore<GuildMemberStore & Store>("GuildMemberStore");

export type Users = UserStore & GuildMemberStore;

export default virtualMerge(
  Object.getPrototypeOf(UserStore),
  Object.getPrototypeOf(GuildMemberStore),
) as Users;
