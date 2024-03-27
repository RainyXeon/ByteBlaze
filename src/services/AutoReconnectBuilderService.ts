import { Manager } from "../manager.js";
import { RainlinkPlayer } from "../rainlink/main.js";

export class AutoReconnectBuilderService {
  client: Manager;
  player?: RainlinkPlayer;
  constructor(client: Manager, player?: RainlinkPlayer) {
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
      current: "",
      config: {
        loop: "none",
      },
      queue: [],
      twentyfourseven: false,
    });
  }

  async playerBuild(guildId: string, two47mode: boolean = false) {
    return await this.client.db.autoreconnect.set(`${guildId}`, {
      guild: this.player?.guildId,
      text: this.player?.textId,
      voice: this.player?.voiceId,
      current: this.player?.queue.current?.uri ?? "",
      config: {
        loop: this.player?.loop,
      },
      queue: this.player?.queue.length !== 0 ? this.queueUri() : [],
      previous: this.player?.queue.previous.length !== 0 ? this.previousUri() : [],
      twentyfourseven: two47mode,
    });
  }

  async build247(guildId: string, mode: boolean = true, voiceId: string = "") {
    return await this.client.db.autoreconnect.set(`${guildId}`, {
      guild: this.player?.guildId,
      text: this.player?.textId,
      voice: voiceId,
      current: "",
      config: {
        loop: "none",
      },
      queue: [],
      twentyfourseven: mode,
    });
  }

  queueUri() {
    const res = [];
    for (let data of this.player?.queue!) {
      res.push(data.uri);
    }
    return res;
  }

  previousUri() {
    const res = [];
    for (let data of this.player?.queue.previous!) {
      res.push(data.uri);
    }
    return res;
  }
}
