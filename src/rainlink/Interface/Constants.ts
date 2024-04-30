/**
 * All rainlink manager events
 */
export enum RainlinkEvents {
  Debug = "debug",
  // Node
  NodeConnect = "nodeConnect",
  NodeDisconnect = "nodeDisconnect",
  NodeClosed = "nodeClosed",
  NodeError = "nodeError",
  // Player
  PlayerCreate = "playerCreate",
  PlayerDestroy = "playerDestroy",
  PlayerConnect = "playerConnect",
  PlayerDisconnect = "playerDisconnect",
  PlayerUpdate = "playerUpdate",
  PlayerMoved = "playerMoved",
  PlayerPause = "playerPause",
  PlayerResume = "playerResume",
  PlayerException = "playerException",
  PlayerWebsocketClosed = "playerWebsocketClosed",
  PlayerStop = "playerStop",
  // Track
  TrackStuck = "trackStuck",
  TrackStart = "trackStart",
  TrackEnd = "trackEnd",
  TrackResolveError = "trackResolveError",
  // Queue
  QueueAdd = "queueAdd",
  QueueRemove = "queueRemove",
  QueueShuffle = "queueShuffle",
  QueueClear = "queueClear",
  QueueEmpty = "queueEmpty",
  // Voice receiver
  VoiceConnect = "voiceConnect",
  VoiceDisconnect = "voiceDisconnect",
  VoiceError = "voiceError",
  VoiceStartSpeaking = "voiceStartSpeaking",
  VoiceEndSpeaking = "voiceEndSpeaking",
}

/**
 * Rainlink node connect state
 */
export enum RainlinkConnectState {
  Connected,
  Disconnected,
  Closed,
}

/**
 * Discord voice state
 */
export enum VoiceState {
  SESSION_READY,
  SESSION_ID_MISSING,
  SESSION_ENDPOINT_MISSING,
  SESSION_FAILED_UPDATE,
}

/**
 * Discord voice connect status state
 */
export enum VoiceConnectState {
  CONNECTING,
  NEARLY,
  CONNECTED,
  RECONNECTING,
  DISCONNECTING,
  DISCONNECTED,
}

/**
 * Lavalink load type enum
 */
export enum LavalinkLoadType {
  TRACK = "track",
  PLAYLIST = "playlist",
  SEARCH = "search",
  EMPTY = "empty",
  ERROR = "error",
}

/**
 * Lavalink default source
 */
export const SourceIDs = [
  { name: "youtube", id: "yt" },
  { name: "youtubeMusic", id: "ytm" },
  { name: "soundcloud", id: "sc" },
];

/**
 * Rainlink plugin type
 */
export enum RainlinkPluginType {
  Default = "default",
  SourceResolver = "sourceResolver",
}

/**
 * Rainlink player connect state
 */
export enum RainlinkPlayerState {
  CONNECTED,
  DISCONNECTED,
  DESTROYED,
}

/**
 * Rainlink loop enum
 */
export enum RainlinkLoopMode {
  SONG = "song",
  QUEUE = "queue",
  NONE = "none",
}

/** @ignore */
export const RainlinkFilterData = {
  clear: {},

  eightD: {
    rotation: {
      rotationHz: 0.2,
    },
  },

  soft: {
    lowPass: {
      smoothing: 20.0,
    },
  },

  speed: {
    timescale: {
      speed: 1.501,
      pitch: 1.245,
      rate: 1.921,
    },
  },

  karaoke: {
    karaoke: {
      level: 1.0,
      monoLevel: 1.0,
      filterBand: 220.0,
      filterWidth: 100.0,
    },
  },
  nightcore: {
    timescale: {
      speed: 1.05,
      pitch: 1.125,
      rate: 1.05,
    },
  },

  pop: {
    equalizer: [
      { band: 0, gain: -0.25 },
      { band: 1, gain: 0.48 },
      { band: 2, gain: 0.59 },
      { band: 3, gain: 0.72 },
      { band: 4, gain: 0.56 },
      { band: 6, gain: -0.24 },
      { band: 8, gain: -0.16 },
    ],
  },

  vaporwave: {
    equalizer: [
      { band: 1, gain: 0.3 },
      { band: 0, gain: 0.3 },
    ],
    timescale: { pitch: 0.5 },
    tremolo: { depth: 0.3, frequency: 14 },
  },

  bass: {
    equalizer: [
      { band: 0, gain: 0.1 },
      { band: 1, gain: 0.1 },
      { band: 2, gain: 0.05 },
      { band: 3, gain: 0.05 },
      { band: 4, gain: -0.05 },
      { band: 5, gain: -0.05 },
      { band: 6, gain: 0 },
      { band: 7, gain: -0.05 },
      { band: 8, gain: -0.05 },
      { band: 9, gain: 0 },
      { band: 10, gain: 0.05 },
      { band: 11, gain: 0.05 },
      { band: 12, gain: 0.1 },
      { band: 13, gain: 0.1 },
    ],
  },

  party: {
    equalizer: [
      { band: 0, gain: -1.16 },
      { band: 1, gain: 0.28 },
      { band: 2, gain: 0.42 },
      { band: 3, gain: 0.5 },
      { band: 4, gain: 0.36 },
      { band: 5, gain: 0 },
      { band: 6, gain: -0.3 },
      { band: 7, gain: -0.21 },
      { band: 8, gain: -0.21 },
    ],
  },

  earrape: {
    equalizer: [
      { band: 0, gain: 0.25 },
      { band: 1, gain: 0.5 },
      { band: 2, gain: -0.5 },
      { band: 3, gain: -0.25 },
      { band: 4, gain: 0 },
      { band: 6, gain: -0.025 },
      { band: 7, gain: -0.0175 },
      { band: 8, gain: 0 },
      { band: 9, gain: 0 },
      { band: 10, gain: 0.0125 },
      { band: 11, gain: 0.025 },
      { band: 12, gain: 0.375 },
      { band: 13, gain: 0.125 },
      { band: 14, gain: 0.125 },
    ],
  },

  equalizer: {
    equalizer: [
      { band: 0, gain: 0.375 },
      { band: 1, gain: 0.35 },
      { band: 2, gain: 0.125 },
      { band: 5, gain: -0.125 },
      { band: 6, gain: -0.125 },
      { band: 8, gain: 0.25 },
      { band: 9, gain: 0.125 },
      { band: 10, gain: 0.15 },
      { band: 11, gain: 0.2 },
      { band: 12, gain: 0.25 },
      { band: 13, gain: 0.35 },
      { band: 14, gain: 0.4 },
    ],
  },

  electronic: {
    equalizer: [
      { band: 0, gain: 0.375 },
      { band: 1, gain: 0.35 },
      { band: 2, gain: 0.125 },
      { band: 5, gain: -0.125 },
      { band: 6, gain: -0.125 },
      { band: 8, gain: 0.25 },
      { band: 9, gain: 0.125 },
      { band: 10, gain: 0.15 },
      { band: 11, gain: 0.2 },
      { band: 12, gain: 0.25 },
      { band: 13, gain: 0.35 },
      { band: 14, gain: 0.4 },
    ],
  },
  radio: {
    equalizer: [
      { band: 0, gain: -0.25 },
      { band: 1, gain: 0.48 },
      { band: 2, gain: 0.59 },
      { band: 3, gain: 0.72 },
      { band: 4, gain: 0.56 },
      { band: 6, gain: -0.24 },
      { band: 8, gain: -0.16 },
    ],
  },

  tremolo: {
    tremolo: {
      depth: 0.3,
      frequency: 14,
    },
  },

  treblebass: {
    equalizer: [
      { band: 0, gain: 0.6 },
      { band: 1, gain: 0.67 },
      { band: 2, gain: 0.67 },
      { band: 3, gain: 0 },
      { band: 4, gain: -0.5 },
      { band: 5, gain: 0.15 },
      { band: 6, gain: -0.45 },
      { band: 7, gain: 0.23 },
      { band: 8, gain: 0.35 },
      { band: 9, gain: 0.45 },
      { band: 10, gain: 0.55 },
      { band: 11, gain: 0.6 },
      { band: 12, gain: 0.55 },
    ],
  },

  vibrato: {
    vibrato: {
      depth: 0.3,
      frequency: 14,
    },
  },

  china: {
    timescale: {
      speed: 0.75,
      pitch: 1.25,
      rate: 1.25,
    },
  },

  chimpunk: {
    timescale: {
      speed: 1.05,
      pitch: 1.35,
      rate: 1.25,
    },
  },

  darthvader: {
    timescale: {
      speed: 0.975,
      pitch: 0.5,
      rate: 0.8,
    },
  },

  daycore: {
    equalizer: [
      { band: 0, gain: 0 },
      { band: 1, gain: 0 },
      { band: 2, gain: 0 },
      { band: 3, gain: 0 },
      { band: 4, gain: 0 },
      { band: 5, gain: 0 },
      { band: 6, gain: 0 },
      { band: 7, gain: 0 },
      { band: 8, gain: -0.25 },
      { band: 9, gain: -0.25 },
      { band: 10, gain: -0.25 },
      { band: 11, gain: -0.25 },
      { band: 12, gain: -0.25 },
      { band: 13, gain: -0.25 },
    ],
    timescale: {
      pitch: 0.63,
      rate: 1.05,
    },
  },

  doubletime: {
    timescale: {
      speed: 1.165,
    },
  },

  pitch: {
    timescale: { pitch: 3 },
  },

  rate: {
    timescale: { rate: 2 },
  },

  slow: {
    timescale: {
      speed: 0.5,
      pitch: 1.0,
      rate: 0.8,
    },
  },
};

export type RainlinkFilterMode = keyof typeof RainlinkFilterData;
