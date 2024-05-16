import { Manager } from "../../manager.js";
import { EmbedBuilder, TextChannel } from "discord.js";
import util from "node:util";
import { AutoReconnectBuilderService } from "../../services/AutoReconnectBuilderService.js";
import { ClearMessageService } from "../../services/ClearMessageService.js";
import { RainlinkPlayer, RainlinkPlayerState } from "../../rainlink/main.js";

export default class {
  async execute(client: Manager, player: RainlinkPlayer, data: Record<string, any>) {
    client.logger.error("PlayerException", `Player get exception ${util.inspect(data)}`);
    /////////// Update Music Setup //////////
    await client.UpdateMusic(player);
    /////////// Update Music Setup ///////////
    const fetch_channel = await client.channels.fetch(player.textId).catch(() => undefined);
    const text_channel = fetch_channel! as TextChannel;
    if (text_channel) {
      await text_channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setDescription("Player get exception, please contact with owner to fix this error"),
        ],
      });
    }

    const data247 = await new AutoReconnectBuilderService(client, player).get(player.guildId);
    const channel = (await client.channels.fetch(player.textId).catch(() => undefined)) as TextChannel;
    if (data247 !== null && data247 && data247.twentyfourseven && channel)
      new ClearMessageService(client, channel, player);

    const currentPlayer = client.rainlink.players.get(player.guildId) as RainlinkPlayer;
    if (!currentPlayer) return;
    if (!currentPlayer.sudoDestroy) await player.destroy();
  }
}
