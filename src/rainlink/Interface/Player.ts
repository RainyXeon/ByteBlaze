export interface VoiceChannelOptions {
  guildId: string;
  shardId: number;
  voiceId: string;
  textId: string;
  volume?: number;
  nodeName?: string;
  deaf?: boolean;
  mute?: boolean;
}

export interface FilterOptions {
  volume?: number;
  equalizer?: Band[];
  karaoke?: Karaoke | null;
  timescale?: Timescale | null;
  tremolo?: Freq | null;
  vibrato?: Freq | null;
  rotation?: Rotation | null;
  distortion?: Distortion | null;
  channelMix?: ChannelMix | null;
  lowPass?: LowPass | null;
}

export interface Band {
  band: number;
  gain: number;
}

export interface Karaoke {
  level?: number;
  monoLevel?: number;
  filterBand?: number;
  filterWidth?: number;
}

export interface Timescale {
  speed?: number;
  pitch?: number;
  rate?: number;
}

export interface Freq {
  frequency?: number;
  depth?: number;
}

export interface Rotation {
  rotationHz?: number;
}

export interface Distortion {
  sinOffset?: number;
  sinScale?: number;
  cosOffset?: number;
  cosScale?: number;
  tanOffset?: number;
  tanScale?: number;
  offset?: number;
  scale?: number;
}

export interface ChannelMix {
  leftToLeft?: number;
  leftToRight?: number;
  rightToLeft?: number;
  rightToRight?: number;
}

export interface LowPass {
  smoothing?: number;
}

export interface PlayOptions {
  noReplace?: boolean;
  pause?: boolean;
  startTime?: number;
  endTime?: number;
  replaceCurrent?: boolean;
  position?: number;
}

export interface PlayEncodedOptions {
  encoded: string;
  options?: {
    noReplace?: boolean;
    pause?: boolean;
    startTime?: number;
    endTime?: number;
    volume?: number;
  };
}
