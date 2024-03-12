import { KazagumoPlayer } from "../../lib/main.js";
import { Manager } from "../../manager.js";
import { TrackExceptionEvent } from "shoukaku";
import { TextChannel } from "discord.js";
import util from "node:util";
import { AutoReconnectBuilderService } from "../../services/AutoReconnectBuilderService.js";
import { ClearMessageService } from "../../services/ClearMessageService.js";

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

    const data247 = await new AutoReconnectBuilderService(client, player).get(player.guildId);
    const channel = client.channels.cache.get(player.textId) as TextChannel;
    if (data247 !== null && data247 && data247.twentyfourseven && channel)
      return new ClearMessageService(client, channel, player);

    const currentPlayer = (await client.manager.getPlayer(player.guildId)) as KazagumoPlayer;
    if (!currentPlayer) return;
    if (currentPlayer.voiceId !== null) {
      await player.destroy();
    }
  }
}
