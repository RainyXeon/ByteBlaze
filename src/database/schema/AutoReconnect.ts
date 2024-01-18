import { Track } from "shoukaku";

export interface AutoReconnect {
  guild: string;
  text: string;
  voice: string;
  current: Track | undefined;
  config: {
    loop: string;
    volume: number;
  };
  queue: Track[];
  previous: Track[];
  twentyfourseven: boolean;
}
