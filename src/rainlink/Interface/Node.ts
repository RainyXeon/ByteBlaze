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
