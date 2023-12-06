export interface Config {
  bot: Bot;
  lavalink: Lavalink;
  features: Features;
}

export interface Bot {
  TOKEN: string;
  EMBED_COLOR: string;
  OWNER_ID: string;
  LANGUAGE: string;
  LIMIT_TRACK: number;
  LIMIT_PLAYLIST: number;
  SAFE_ICONS_MODE: boolean;
  DELETE_MSG_TIMEOUT: number;
  SAFE_PLAYER_MODE: boolean;
  DEBUG_MODE: boolean;
}

export interface Features {
  DATABASE: Database;
  SHARD_SYSTEM: ShardSystem;
  MESSAGE_CONTENT: MessageContent;
  AUTOFIX_LAVALINK: AutofixLavalink;
  WEB_SERVER: WebServer;
  DEV_ID: string[];
}

export interface AutofixLavalink {
  enable: boolean;
  reconnectTries: number;
  restTimeout: number;
}

export interface Database {
  driver: string;
  config: Record<string, any>;
}

export interface MessageContent {
  enable: boolean;
  prefix: string;
}

export interface ShardSystem {
  enable: boolean;
  totalShards: number;
  totalClusters: number;
  shardsPerClusters: number;
  mode: string;
}

export interface WebServer {
  enable: boolean;
  port: number;
  websocket: Websocket;
}

export interface Websocket {
  enable: boolean;
  host: string;
  secret: string;
  auth: boolean;
  trusted: string[];
}

export interface Lavalink {
  SPOTIFY: Spotify;
  DEFAULT: string[];
  NP_REALTIME: boolean;
  LEAVE_TIMEOUT: number;
  NODES: Node[];
  SHOUKAKU_OPTIONS: ShoukakuOptions;
}

export interface Node {
  url: string;
  name: string;
  auth: string;
  secure: boolean;
}

export interface ShoukakuOptions {
  moveOnDisconnect: boolean;
  resumable: boolean;
  resumableTimeout: number;
  reconnectTries: number;
  restTimeout: number;
}

export interface Spotify {
  enable: boolean;
  id: string;
  secret: string;
}
