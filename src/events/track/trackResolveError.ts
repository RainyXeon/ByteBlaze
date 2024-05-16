import { Manager } from "../../manager.js";
import { TextChannel, EmbedBuilder } from "discord.js";
import { AutoReconnectBuilderService } from "../../services/AutoReconnectBuilderService.js";
import { ClearMessageService } from "../../services/ClearMessageService.js";
import { RainlinkPlayer, RainlinkPlayerState, RainlinkTrack } from "../../rainlink/main.js";

export default class {
  async execute(client: Manager, player: RainlinkPlayer, track: RainlinkTrack, message: string) {
    if (!client.isDatabaseConnected)
      return client.logger.warn(
        "DatabaseService",
        "The database is not yet connected so this event will temporarily not execute. Please try again later!"
      );

    const guild = await client.guilds.fetch(player.guildId).catch(() => undefined);

    client.logger.error("TrackResolveError", message);

    /////////// Update Music Setup //////////
    await client.UpdateMusic(player);
    /////////// Update Music Setup ///////////

    const channel = (await client.channels.fetch(player.textId).catch(() => undefined)) as TextChannel;

    let guildModel = await client.db.language.get(`${player.guildId}`);
    if (!guildModel) {
      guildModel = await client.db.language.set(`${player.guildId}`, client.config.bot.LANGUAGE);
    }

    const language = guildModel;

    const embed = new EmbedBuilder()
      .setColor(client.color)
      .setDescription(`${client.getString(language, "event.player", "error_desc")}`);

    if (channel) {
      const setup = await client.db.setup.get(player.guildId);
      const msg = await channel.send({ embeds: [embed] });
      setTimeout(
        async () => (!setup || setup == null || setup.channel !== channel.id ? msg.delete().catch(() => null) : true),
        client.config.bot.DELETE_MSG_TIMEOUT
      );
    }

    client.logger.error("TrackResolveError", `Track Error in ${guild!.name} / ${player.guildId}.`);

    const data247 = await new AutoReconnectBuilderService(client, player).get(player.guildId);
    if (data247 !== null && data247 && data247.twentyfourseven && channel)
      new ClearMessageService(client, channel, player);

    const currentPlayer = client.rainlink.players.get(player.guildId) as RainlinkPlayer;
    if (!currentPlayer) return;
    if (!currentPlayer.sudoDestroy) await player.destroy();
  }
}
