export type LavalinkDataType = {
  host: string;
  port: number;
  pass: string;
  secure: boolean;
  name: string;
  online: boolean;
};

export type LavalinkUsingDataType = {
  host: string;
  port: number;
  pass: string;
  secure: boolean;
  name: string;
};

export type Headers = {
  "Client-Name": string;
  "User-Agent": string;
  Authorization: string;
  "User-Id": string;
  "Resume-Key": string;
};

export type KazagumoLoopMode = "none" | "queue" | "track" | undefined;

export const KazagumoLoop = {
  none: "none" as KazagumoLoopMode,
  queue: "queue" as KazagumoLoopMode,
  track: "track" as KazagumoLoopMode,
};
