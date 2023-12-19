import { KazagumoPlayer } from "better-kazagumo";
import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager, player: KazagumoPlayer) {
    if (!client.is_db_connected)
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

    await player.destroy();

    if (client.websocket)
      client.websocket.send(
        JSON.stringify({ op: "player_destroy", guild: player.guildId })
      );
  }
}
