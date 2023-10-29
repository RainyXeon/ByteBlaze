import { KazagumoPlayer } from "better-kazagumo";
import { Manager } from "../../manager.js";

export default async (client: Manager, player: KazagumoPlayer) => {
  const guild = await client.guilds.cache.get(player.guildId);
  client.logger.info(`Player Resumed in @ ${guild!.name} / ${player.guildId}`);
};
