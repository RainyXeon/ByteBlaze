import { KazagumoPlayer, KazagumoTrack } from "better-kazagumo";
import { Manager } from "../../manager.js";
import { TextChannel, EmbedBuilder } from "discord.js";

export default class {
  async execute(
    client: Manager,
    player: KazagumoPlayer,
    track: KazagumoTrack,
    message: string
  ) {
    if (!client.is_db_connected)
      return client.logger.warn(
        "The database is not yet connected so this event will temporarily not execute. Please try again later!"
      );

    const guild = await client.guilds.cache.get(player.guildId);

    client.logger.log({ level: "error", message: message });

    /////////// Update Music Setup //////////
    await client.UpdateMusic(player);
    /////////// Update Music Setup ///////////

    const channel = client.channels.cache.get(player.textId) as TextChannel;
    if (!channel) return;

    let guildModel = await client.db.language.get(`${channel.guild.id}`);
    if (!guildModel) {
      guildModel = await client.db.language.set(`${channel.guild.id}`, "en");
    }

    const language = guildModel;

    const embed = new EmbedBuilder()
      .setColor(client.color)
      .setDescription(`${client.i18n.get(language, "player", "error_desc")}`);

    if (channel) {
      const msg = await channel.send({ embeds: [embed] });
      setTimeout(
        async () => msg.delete(),
        client.config.bot.DELETE_MSG_TIMEOUT
      );
    }

    client.logger.error(
      `Track Error in ${guild!.name} / ${player.guildId}. Auto-Leaved!`
    );
    await player.destroy();
    if (client.websocket)
      client.websocket.send(
        JSON.stringify({ op: "player_destroy", guild: player.guildId })
      );
  }
}
