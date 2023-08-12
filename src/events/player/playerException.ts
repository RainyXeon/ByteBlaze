import { KazagumoPlayer } from "kazagumo";
import { Manager } from "../../manager.js";
import { TrackExceptionEvent } from "shoukaku";

export default async (
  client: Manager,
  player: KazagumoPlayer,
  data: TrackExceptionEvent,
) => {
  client.logger.error(`Player get exception ${data}`);
  await player.destroy();
  if (client.websocket)
    client.websocket.send(
      JSON.stringify({ op: "player_destroy", guild: player.guildId }),
    );
};
