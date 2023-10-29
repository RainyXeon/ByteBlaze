import { KazagumoPlayer } from "better-kazagumo";
import { Manager } from "../manager.js";
import { TextChannel } from "discord.js";

export async function clearMsg(
  client: Manager,
  channel: TextChannel,
  player: KazagumoPlayer
) {
  const nplaying_msg_id = client.nplaying_msg.get(player.guildId);
  const nplaying_msg = await channel.messages.cache.get(
    String(nplaying_msg_id)
  );
  if (nplaying_msg) {
    nplaying_msg.delete();
    client.nplaying_msg.delete(player.guildId);
  }
}
