import {
  KazagumoPlayer,
  PlayerMovedChannels,
  PlayerMovedState,
} from "better-kazagumo";
import { Manager } from "../../manager.js";

export default async (
  client: Manager,
  player: KazagumoPlayer,
  state: PlayerMovedState,
  channels: PlayerMovedChannels
) => {
  const guild = await client.guilds.cache.get(player.guildId);
  client.logger.info(`Player Moved in @ ${guild!.name} / ${player.guildId}`);
  return player.setVoiceChannel(player.voiceId!);
};
