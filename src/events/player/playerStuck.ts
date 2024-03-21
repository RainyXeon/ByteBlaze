import { KazagumoPlayer } from "../../lib/main.js";
import { Manager } from "../../manager.js";
import { TextChannel, EmbedBuilder } from "discord.js";
import { TrackStuckEvent } from "shoukaku";
import { AutoReconnectBuilderService } from "../../services/AutoReconnectBuilderService.js";
import { ClearMessageService } from "../../services/ClearMessageService.js";

export default class {
  async execute(client: Manager, player: KazagumoPlayer, data: TrackStuckEvent) {
    if (!client.isDatabaseConnected)
      return client.logger.warn(
        import.meta.url,
        "The database is not yet connected so this event will temporarily not execute. Please try again later!"
      );

    /////////// Update Music Setup //////////
    await client.UpdateMusic(player);
    /////////// Update Music Setup ///////////

    const guild = await client.guilds.fetch(player.guildId);

    const channel = (await client.channels.fetch(player.textId)) as TextChannel;
    if (!channel) return;

    let guildModel = await client.db.language.get(`${channel.guild.id}`);
    if (!guildModel) {
      guildModel = await client.db.language.set(`${channel.guild.id}`, client.config.bot.LANGUAGE);
    }

    const language = guildModel;

    const embed = new EmbedBuilder()
      .setColor(client.color)
      .setDescription(`${client.i18n.get(language, "event.player", "error_desc")}`);

    if (channel) {
      const setup = await client.db.setup.get(player.guildId);
      const msg = await channel.send({ embeds: [embed] });
      setTimeout(
        async () => (!setup || setup == null || setup.channel !== channel.id ? msg.delete() : true),
        client.config.bot.DELETE_MSG_TIMEOUT
      );
    }

    client.logger.error(import.meta.url, `Track Stuck in ${guild!.name} / ${player.guildId}.`);

    const data247 = await new AutoReconnectBuilderService(client, player).get(player.guildId);
    if (data247 !== null && data247 && data247.twentyfourseven && channel)
      return new ClearMessageService(client, channel, player);

    const currentPlayer = (await client.manager.getPlayer(player.guildId)) as KazagumoPlayer;
    if (!currentPlayer) return;
    if (currentPlayer.voiceId !== null) {
      await player.destroy();
    }
  }
}
