import { RainlinkNodeOptions } from "../rainlink/main.js";

export interface Config {
  bot: Bot;
  lavalink: Lavalink;
  features: Features;
}

export interface Bot {
  TOKEN: string[];
  EMBED_COLOR: string;
  OWNER_ID: string;
  ADMIN: string[];
  LANGUAGE: string;
  LIMIT_TRACK: number;
  LIMIT_PLAYLIST: number;
  SAFE_ICONS_MODE: boolean;
  DELETE_MSG_TIMEOUT: number;
  DEBUG_MODE: boolean;
}

export interface Features {
  DATABASE: Database;
  TOPGG_TOKEN: string;
  MESSAGE_CONTENT: MessageContent;
  AUTOFIX_LAVALINK: AutofixLavalink;
  WEB_SERVER: WebServer;
  PREMIUM_LOG_CHANNEL: string;
  GUILD_LOG_CHANNEL: string;
  LOG_CHANNEL: string;
}

export interface AutofixLavalink {
  enable: boolean;
  retryCount: number;
  retryTimeout: number;
}

export interface Database {
  driver: string;
  config: any;
}

export interface MessageContent {
  enable: boolean;
  commands: Commands;
}

export interface Commands {
  enable: boolean;
  prefix: string;
}

export interface WebServer {
  enable: boolean;
  port: number;
  auth: string;
  whitelist: string[];
}

export interface Lavalink {
  SPOTIFY: Spotify;
  AUTOCOMPLETE_SEARCH: string[];
  NP_REALTIME: boolean;
  LEAVE_TIMEOUT: number;
  NODES: RainlinkNodeOptions[];
  DEFAULT_VOLUME: number;
  AVOID_SUSPEND: boolean;
}

export interface Spotify {
  enable: boolean;
  id: string;
  secret: string;
}
