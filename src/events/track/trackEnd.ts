import { Manager } from "../../manager.js";
import { TextChannel } from "discord.js";
import { ClearMessageService } from "../../services/ClearMessageService.js";
import { AutoReconnectBuilderService } from "../../services/AutoReconnectBuilderService.js";
import { RainlinkPlayer, RainlinkPlayerState } from "../../rainlink/main.js";

export default class {
  async execute(client: Manager, player: RainlinkPlayer) {
    if (!client.isDatabaseConnected)
      return client.logger.warn(
        "DatabaseService",
        "The database is not yet connected so this event will temporarily not execute. Please try again later!"
      );

    const guild = await client.guilds.fetch(player.guildId).catch(() => undefined);
    client.logger.info("TrackEnd", `Track ended in @ ${guild!.name} / ${player.guildId}`);

    /////////// Update Music Setup //////////
    await client.UpdateMusic(player);
    /////////// Update Music Setup ///////////

    client.emit("playerEnd", player);

    let data = await new AutoReconnectBuilderService(client, player).get(player.guildId);
    const channel = (await client.channels.fetch(player.textId).catch(() => undefined)) as TextChannel;
    if (channel) {
      if (data && data.twentyfourseven) return;

      if (player.queue.length || player!.queue!.current) return new ClearMessageService(client, channel, player);

      if (player.loop !== "none") return new ClearMessageService(client, channel, player);
    }

    const currentPlayer = client.rainlink.players.get(player.guildId) as RainlinkPlayer;
    if (!currentPlayer) return;
    if (!currentPlayer.sudoDestroy) await player.destroy();
  }
}
