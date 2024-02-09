import { KazagumoPlayer } from "../lib/main.js";
import { Manager } from "../manager.js";
import { TextChannel } from "discord.js";

export class ClearMessageService {
  client: Manager;
  channel: TextChannel;
  player: KazagumoPlayer;
  constructor(client: Manager, channel: TextChannel, player: KazagumoPlayer) {
    this.channel = channel;
    this.client = client;
    this.player = player;
    this.execute();
  }

  async execute() {
    const nplayingMsg = this.client.nplayingMsg.get(this.player.guildId);
    if (!nplayingMsg) return;
    nplayingMsg.delete();
    this.client.nplayingMsg.delete(this.player.guildId);
  }
}
