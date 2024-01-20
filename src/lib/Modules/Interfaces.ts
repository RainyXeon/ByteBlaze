/**
 * All the code below is from kazagumo.mod
 * An edited version is retrieved from
 * https://github.com/Takiyo0/Kazagumo/tree/d118eaf22559bd3f2159e2e147a67876d3986669
 * Original developer: Takiyo0 (Github)
 * Mod developer: RainyXeon (Github)
 * Special thanks to Takiyo0 (Github)
 */

import { Kazagumo } from "../Kazagumo.js";
import { KazagumoPlayer } from "../Managers/KazagumoPlayer.js";
import { KazagumoTrack } from "../Managers/Supports/KazagumoTrack.js";
import { Constructor } from "./Utils.js";
import { Snowflake } from "discord.js";
import { Track } from "shoukaku";

export interface KazagumoOptions {
  /** Default search engine if no engine was provided. Default to youtube */
  defaultSearchEngine: SearchEngines;
  /** Kazagumo plugins */
  plugins?: KazagumoPlugin[];
  /** Source that will be forced to resolve when playing it */
  sourceForceResolve?: string[];
  /** The track resolver. Make sure you set <KazagumoTrack>.track for it to work. (I'm not responsible for any error during playback if you don't set it right) */
  trackResolver?: (
    this: KazagumoTrack,
    options?: ResolveOptions
  ) => Promise<boolean>;
  /** The default youtube thumbnail's size */
  defaultYoutubeThumbnail?: YoutubeThumbnail;
  /** Extend some of the Structures */
  extends?: {
    player?: Constructor<KazagumoPlayer>;
  };
  /** Send to guild's shard */
  send: (guildId: Snowflake, payload: Payload) => void;
}

export type SearchEngines = "youtube" | "soundcloud" | "youtube_music" | string;
export type YoutubeThumbnail =
  | "default"
  | "hqdefault"
  | "mqdefault"
  | "sddefault"
  | "maxresdefault";

export interface Payload {
  /** The OP code */
  op: number;
  d: {
    guild_id: string;
    channel_id: string | null;
    self_mute: boolean;
    self_deaf: boolean;
  };
}

export const escapeRegExp = (str: string) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const SourceIDs = {
  youtube: "yt",
  youtube_music: "ytm",
  soundcloud: "sc",
};

export interface KazagumoPlayerOptions {
  guildId: Snowflake;
  voiceId: Snowflake;
  textId: Snowflake;
  deaf: boolean;
  volume: number;
  /** Whether the node for searching track should be the same as the node for playing track. Default: true */
  searchWithSameNode?: boolean;
}

export interface ResolveOptions {
  overwrite?: boolean;
  forceResolve?: boolean;
  player?: KazagumoPlayer;
}

export interface CreatePlayerOptions {
  /** The player's guild ID */
  guildId: Snowflake;
  /** The player's voice ID */
  voiceId: Snowflake;
  /** The player's text ID */
  textId: Snowflake;
  /** Whether the bot should deafen */
  deaf?: boolean;
  /** Whether the bot should mute */
  mute?: boolean;
  /** The player's guild's shardId */
  shardId?: number;
  /** Balance the node? */
  loadBalancer?: boolean;
  /** The player's volume */
  volume?: number;
  /** Use specific node */
  nodeName?: string;
  /** The player's data, usable when you extends it */
  data?: unknown;
}

export interface RawTrack {
  track: string;
  info: {
    title: string;
    uri?: string;
    identifier: string;
    sourceName: string;
    isSeekable: boolean;
    isStream: boolean;
    author?: string;
    length?: number;
    position?: number;
    thumbnail?: string;
  };
  _raw: Track;
}

export const Events = {
  // Player events
  PlayerDestroy: "playerDestroy",
  PlayerCreate: "playerCreate",
  PlayerStart: "playerStart",
  PlayerEnd: "playerEnd",
  PlayerEmpty: "playerEmpty",
  PlayerClosed: "playerClosed",
  PlayerUpdate: "playerUpdate",
  PlayerException: "playerException",
  PlayerError: "playerError",
  PlayerResumed: "playerResumed",
  PlayerStuck: "playerStuck",
  PlayerResolveError: "playerResolveError",
  PlayerMoved: "playerMoved",
  PlayerPause: "playerPause",
  PlayerResume: "playerResume",
  QueueUpdate: "queueUpdate",

  // Kazagumo events
  Debug: "debug",
};

export interface PlayerMovedChannels {
  oldChannelId?: string | null;
  newChannelId?: string | null;
}

export type PlayerMovedState = "UNKNOWN" | "JOINED" | "LEFT" | "MOVED";

export interface KazagumoSearchOptions {
  requester: unknown;
  engine?: SearchEngines;
  nodeName?: string;
}

export interface KazagumoSearchResult {
  type: SearchResultTypes;
  playlistName?: string;
  tracks: KazagumoTrack[];
}

export type SearchResultTypes = "PLAYLIST" | "TRACK" | "SEARCH";

export const SupportedSources = [
  "bandcamp",
  "beam",
  "getyarn",
  "http",
  "local",
  "nico",
  "soundcloud",
  "stream",
  "twitch",
  "vimeo",
  "youtube",
];

export interface PlayOptions {
  noReplace?: boolean;
  pause?: boolean;
  startTime?: number;
  endTime?: number;

  replaceCurrent?: boolean;
}

export enum State {
  CONNECTING,
  NEARLY,
  CONNECTED,
  RECONNECTING,
  DISCONNECTING,
  DISCONNECTED,
}

export enum PlayerState {
  CONNECTING,
  CONNECTED,
  DISCONNECTING,
  DISCONNECTED,
  DESTROYING,
  DESTROYED,
}

export class KazagumoPlugin {
  public load(kazagumo: Kazagumo): void {
    throw new KazagumoError(1, "Plugin must implement load()");
  }

  public unload(kazagumo: Kazagumo): void {
    throw new KazagumoError(1, "Plugin must implement unload()");
  }
}

/* tslint:disable:max-classes-per-file */
export class KazagumoError extends Error {
  public code: number;
  public message: string;
  public constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.message = message;
  }
}

export enum VoiceState {
  SESSION_READY,
  SESSION_ID_MISSING,
  SESSION_ENDPOINT_MISSING,
  SESSION_FAILED_UPDATE,
}
