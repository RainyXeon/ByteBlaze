import { TextChannel } from "discord.js";
import { Manager } from "../../manager.js";
import { AutoReconnectBuilderService } from "../../services/AutoReconnectBuilderService.js";
import { ClearMessageService } from "../../services/ClearMessageService.js";
import { RainlinkPlayer } from "../../rainlink/main.js";

export default class {
  async execute(client: Manager, player: RainlinkPlayer) {
    if (!client.isDatabaseConnected)
      return client.logger.warn(
        import.meta.url,
        "The database is not yet connected so this event will temporarily not execute. Please try again later!"
      );

    /////////// Update Music Setup //////////
    await client.UpdateMusic(player);
    /////////// Update Music Setup ///////////

    const guild = await client.guilds.fetch(player.guildId);

    if (player.data.get("autoplay") === true) {
      const requester = player.data.get("requester");
      const identifier = player.data.get("identifier");
      const search = `https://www.youtube.com/watch?v=${identifier}&list=RD${identifier}`;
      let res = await player.search(search, { requester: requester });
      player.queue.add(res.tracks[2]);
      player.queue.add(res.tracks[3]);
      player.play();
      return;
    }

    client.logger.info(import.meta.url, `Player Empty in @ ${guild!.name} / ${player.guildId}`);

    const data = await new AutoReconnectBuilderService(client, player).get(player.guildId);
    const channel = (await client.channels.fetch(player.textId)) as TextChannel;
    if (data !== null && data && data.twentyfourseven && channel)
      return new ClearMessageService(client, channel, player);

    const currentPlayer = client.rainlink.players.get(player.guildId) as RainlinkPlayer;
    if (!currentPlayer) return;
    if (currentPlayer.voiceId !== null) {
      await player.destroy();
    }
  }
}
