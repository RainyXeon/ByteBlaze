import { KazagumoPlayer, PlayerState } from "../../lib/main.js";
import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager, player: KazagumoPlayer) {
    if (!client.isDatabaseConnected)
      return client.logger.warn(
        "The database is not yet connected so this event will temporarily not execute. Please try again later!"
      );

    /////////// Update Music Setup //////////
    await client.UpdateMusic(player);
    /////////// Update Music Setup ///////////

    const guild = await client.guilds.cache.get(player.guildId);

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

    client.logger.info(`Player Empty in @ ${guild!.name} / ${player.guildId}`);

    const currentPlayer = (await client.manager.getPlayer(
      player.guildId
    )) as KazagumoPlayer;
    if (!currentPlayer) return;
    if (currentPlayer.voiceId !== null) {
      await player.destroy();
    }
  }
}
