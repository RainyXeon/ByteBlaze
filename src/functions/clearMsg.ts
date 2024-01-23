import { KazagumoPlayer } from "better-kazagumo";
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
    const nplaying_msg_id = this.client.nplaying_msg.get(this.player.guildId);
    if (!nplaying_msg_id) return;
    const nplaying_msg = await this.channel.messages.cache.get(
      String(nplaying_msg_id)
    );
    if (nplaying_msg) {
      nplaying_msg.delete();
      this.client.nplaying_msg.delete(this.player.guildId);
    }
  }
}
