export interface AutoReconnect {
  guild: string;
  text: string;
  voice: string;
  current: string;
  config: {
    loop: string;
    volume: number;
  };
  queue: string[];
  previous: string[];
  twentyfourseven: boolean;
}
