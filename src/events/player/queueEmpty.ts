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

    const guild = await client.guilds.fetch(player.guildId).catch(() => undefined);

    if (player.data.get("autoplay") === true) {
      const requester = player.data.get("requester");
      const identifier = player.data.get("identifier");
      const search = `https://www.youtube.com/watch?v=${identifier}&list=RD${identifier}`;
      let res = await player.search(search, { requester: requester });
      const finalRes = res.tracks.filter((track) => {
        const req1 = !player.queue.some((s) => s.encoded === track.encoded);
        const req2 = !player.queue.previous.some((s) => s.encoded === track.encoded);
        return req1 && req2;
      });
      if (finalRes.length !== 0) {
        player.queue.add(finalRes.length <= 1 ? finalRes[0] : finalRes[1]);
        player.play();
        const channel = (await client.channels.fetch(player.textId).catch(() => undefined)) as TextChannel;
        if (channel) return new ClearMessageService(client, channel, player);
        return;
      }
    }

    client.logger.info(import.meta.url, `Player Empty in @ ${guild!.name} / ${player.guildId}`);

    const data = await new AutoReconnectBuilderService(client, player).get(player.guildId);
    const channel = (await client.channels.fetch(player.textId).catch(() => undefined)) as TextChannel;
    if (data !== null && data && data.twentyfourseven && channel) new ClearMessageService(client, channel, player);

    await player.destroy();
  }
}
