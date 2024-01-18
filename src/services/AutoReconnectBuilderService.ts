import { KazagumoPlayer } from "../lib/main.js";
import { Manager } from "../manager.js";

export class AutoReconnectBuilderService {
  client: Manager;
  player?: KazagumoPlayer;
  constructor(client: Manager, player?: KazagumoPlayer) {
    this.client = client;
    this.player = player;
  }

  async execute(guildId: string) {
    const check = await this.client.db.autoreconnect.get(guildId);
    if (check) return check;
    if (!this.player) return await this.noPlayerBuild(guildId);
    return await this.playerBuild(guildId);
  }

  async get(guildId: string) {
    const check = await this.client.db.autoreconnect.get(guildId);
    if (check) return check;
    else null;
  }

  async noPlayerBuild(guildId: string) {
    return await this.client.db.autoreconnect.set(`${guildId}`, {
      guild: guildId,
      text: "",
      voice: "",
      current: undefined,
      config: {
        loop: "none",
        volume: 100,
      },
      queue: [],
      previous: [],
      twentyfourseven: false,
    });
  }

  async playerBuild(guildId: string, two47mode: boolean = false) {
    return await this.client.db.autoreconnect.set(`${guildId}`, {
      guild: this.player?.guildId,
      text: this.player?.textId,
      voice: this.player?.voiceId,
      current:
        (await this.player?.queue.current?.getTrack(this.player!)) ?? undefined,
      config: {
        loop: this.player?.loop,
        volume: this.player?.volume,
      },
      queue: this.player?.queue.length !== 0 ? await this.queueRaw() : [],
      previous:
        this.player?.queue.previous.length !== 0
          ? await this.previousRaw()
          : [],
      twentyfourseven: two47mode,
    });
  }

  async build247(guildId: string, mode: boolean = true, voiceId: string = "") {
    return await this.client.db.autoreconnect.set(`${guildId}`, {
      guild: this.player?.guildId,
      text: this.player?.textId,
      voice: voiceId,
      current: undefined,
      config: {
        loop: "none",
        volume: 100,
      },
      queue: [],
      previous: [],
      twentyfourseven: mode,
    });
  }

  async queueRaw() {
    const res = [];
    for (let data of this.player?.queue!) {
      const track = await data.getTrack(this.player!);
      res.push(track);
    }
    return res;
  }

  async previousRaw() {
    const res = [];
    for (let data of this.player?.queue.previous!) {
      const track = await data.getTrack(this.player!);
      res.push(track);
    }
    return res;
  }
}
