import { KazagumoPlayer } from "better-kazagumo";
import { Manager } from "../../manager.js";
import { TrackExceptionEvent } from "shoukaku";
import { TextChannel } from "discord.js";

export default class {
  async execute(
    client: Manager,
    player: KazagumoPlayer,
    data: TrackExceptionEvent
  ) {
    client.logger.error(`Player get exception ${data}`);
    client.logger.log({ level: "error", message: data });
    /////////// Update Music Setup //////////
    await client.UpdateMusic(player);
    /////////// Update Music Setup ///////////
    const fetch_channel = await client.channels.fetch(player.textId);
    const text_channel = fetch_channel! as TextChannel;
    if (text_channel) {
      await text_channel.send(
        "Player get exception, please contact with owner to fix this error"
      );
    }
    await player.destroy();
    if (client.websocket)
      client.websocket.send(
        JSON.stringify({ op: "player_destroy", guild: player.guildId })
      );
  }
}
