import { KazagumoPlayer } from "../../lib/main.js";
import { Manager } from "../../manager.js";
import { TextChannel, EmbedBuilder } from "discord.js";
import { TrackStuckEvent } from "shoukaku";

export default class {
  async execute(
    client: Manager,
    player: KazagumoPlayer,
    data: TrackStuckEvent
  ) {
    if (!client.isDatabaseConnected)
      return client.logger.warn(
        "The database is not yet connected so this event will temporarily not execute. Please try again later!"
      );

    /////////// Update Music Setup //////////
    await client.UpdateMusic(player);
    /////////// Update Music Setup ///////////

    const guild = await client.guilds.cache.get(player.guildId);

    const channel = client.channels.cache.get(player.textId) as TextChannel;
    if (!channel) return;

    let guildModel = await client.db.language.get(`${channel.guild.id}`);
    if (!guildModel) {
      guildModel = await client.db.language.set(
        `${channel.guild.id}`,
        client.config.bot.LANGUAGE
      );
    }

    const language = guildModel;

    const embed = new EmbedBuilder()
      .setColor(client.color)
      .setDescription(`${client.i18n.get(language, "player", "error_desc")}`);

    if (channel) {
      const setup = await client.db.setup.get(player.guildId);
      const msg = await channel.send({ embeds: [embed] });
      setTimeout(
        async () =>
          setup && setup.channel !== player.textId ? msg.delete() : true,
        client.config.bot.DELETE_MSG_TIMEOUT
      );
    }

    client.logger.error(
      `Track Stuck in ${guild!.name} / ${player.guildId}. Auto-Leaved!`
    );

    const currentPlayer = (await client.manager.getPlayer(
      player.guildId
    )) as KazagumoPlayer;
    if (!currentPlayer) return;
    if (currentPlayer.voiceId !== null) {
      await player.destroy();
    }
  }
}
