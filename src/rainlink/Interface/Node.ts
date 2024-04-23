/** The lavalink server status interface */
export interface NodeStats {
  players: number;
  playingPlayers: number;
  memory: {
    reservable: number;
    used: number;
    free: number;
    allocated: number;
  };
  frameStats: {
    sent: number;
    deficit: number;
    nulled: number;
  };
  cpu: {
    cores: number;
    systemLoad: number;
    lavalinkLoad: number;
  };
  uptime: number;
}

/** The lavalink server status response interface */
export interface LavalinkNodeStatsResponse {
  op: string;
  players: number;
  playingPlayers: number;
  memory: {
    reservable: number;
    used: number;
    free: number;
    allocated: number;
  };
  frameStats: {
    sent: number;
    deficit: number;
    nulled: number;
  };
  cpu: {
    cores: number;
    systemLoad: number;
    lavalinkLoad: number;
  };
  uptime: number;
}

export type NodeInfo = {
  version: NodeInfoVersion;
  buildTime: number;
  git: NodeInfoGit;
  jvm: string;
  lavaplayer: string;
  sourceManagers: string[];
  filters: string[];
  plugins: NodeInfoPlugin[];
};

export type NodeInfoVersion = {
  semver: string;
  major: number;
  minor: number;
  patch: number;
  preRelease?: string;
  build?: string;
};

export type NodeInfoGit = {
  branch: string;
  commit: string;
  commitTime: number;
};

export type NodeInfoPlugin = {
  name: string;
  version: string;
};
