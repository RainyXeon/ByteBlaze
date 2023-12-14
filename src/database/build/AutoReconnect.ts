import { KazagumoPlayer } from "better-kazagumo";
import { Manager } from "../../manager.js";

export class AutoReconnectBuilder {
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
      current: "",
      config: {
        loop: "none",
        volume: 100,
      },
      queue: [],
      twentyfourseven: true,
    });
  }

  async playerBuild(guildId: string) {
    return await this.client.db.autoreconnect.set(`${guildId}`, {
      guild: this.player?.guildId,
      text: this.player?.textId,
      voice: this.player?.voiceId,
      current: this.player?.queue.current ?? "",
      config: {
        loop: this.player?.loop,
        volume: this.player?.volume,
      },
      queue: this.player?.queue.length !== 0 ? this.queueUri() : [],
      twentyfourseven: true,
    });
  }

  queueUri() {
    const res = [];
    for (let data of this.player?.queue!) {
      res.push(data.uri);
    }
    return res;
  }
}
