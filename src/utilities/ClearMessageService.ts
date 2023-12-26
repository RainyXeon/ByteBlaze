import { KazagumoPlayer } from "kazagumo.mod";
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
    const nplayingMsg_id = this.client.nplayingMsg.get(this.player.guildId);
    if (!nplayingMsg_id) return;
    const nplayingMsg = await this.channel.messages.cache.get(
      String(nplayingMsg_id)
    );
    if (nplayingMsg) {
      nplayingMsg.delete();
      this.client.nplayingMsg.delete(this.player.guildId);
    }
  }
}
