import { KazagumoPlayer } from "kazagumo";
import { Manager } from "../../manager.js";
import { TrackExceptionEvent } from "shoukaku";
import { TextChannel } from "discord.js";

export default async (
  client: Manager,
  player: KazagumoPlayer,
  data: TrackExceptionEvent,
) => {
  client.logger.error(`Player get exception ${data}`);
  client.logger.log({ level: "error", message: data });
  const fetch_channel = await client.channels.fetch(player.textId);
  const text_channel = fetch_channel! as TextChannel;
  if (text_channel) {
    await text_channel.send(
      "Player get exception, please contact with owner to fix this error",
    );
  }
  await player.destroy();
  if (client.websocket)
    client.websocket.send(
      JSON.stringify({ op: "player_destroy", guild: player.guildId }),
    );
};
