import { KazagumoPlayer } from "../../lib/main.js";
import { Manager } from "../../manager.js";
import { TrackExceptionEvent } from "shoukaku";
import { TextChannel } from "discord.js";
import util from "node:util";

export default class {
  async execute(client: Manager, player: KazagumoPlayer, data: TrackExceptionEvent) {
    client.logger.error(import.meta.url, `Player get exception ${util.inspect(data)}`);
    /////////// Update Music Setup //////////
    await client.UpdateMusic(player);
    /////////// Update Music Setup ///////////
    const fetch_channel = await client.channels.fetch(player.textId);
    const text_channel = fetch_channel! as TextChannel;
    if (text_channel) {
      await text_channel.send("Player get exception, please contact with owner to fix this error");
    }

    const currentPlayer = (await client.manager.getPlayer(player.guildId)) as KazagumoPlayer;
    if (!currentPlayer) return;
    if (currentPlayer.voiceId !== null) {
      await player.destroy();
    }
  }
}
