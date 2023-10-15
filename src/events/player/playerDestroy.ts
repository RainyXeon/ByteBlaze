import { KazagumoPlayer } from "kazagumo";
import { Manager } from "../../manager.js";
import { EmbedBuilder, Client, TextChannel } from "discord.js";
import { clearMsg } from "../../functions/clearMsg.js";

export default async (client: Manager, player: KazagumoPlayer) => {
  if (!client.is_db_connected)
    return client.logger.warn(
      "The database is not yet connected so this event will temporarily not execute. Please try again later!"
    );

  const guild = await client.guilds.cache.get(player.guildId);
  client.logger.info(`Player Destroy in @ ${guild!.name} / ${player.guildId}`);
  if (client.websocket)
    client.websocket.send(
      JSON.stringify({ op: "player_destroy", guild: player.guildId })
    );
  const channel = client.channels.cache.get(player.textId) as TextChannel;
  client.sent_queue.set(player.guildId, false);
  let data = await client.db.get(`autoreconnect.guild_${player.guildId}`);

  if (!channel) return;

  if (player.state == 5 && data) {
    await client.manager.createPlayer({
      guildId: data.guild,
      voiceId: data.voice,
      textId: data.text,
      deaf: true,
    });
  }

  let guildModel = await client.db.get(`language.guild_${channel.guild.id}`);
  if (!guildModel) {
    guildModel = await client.db.set(
      `language.guild_${channel.guild.id}`,
      "en"
    );
  }

  const language = guildModel;

  const embed = new EmbedBuilder()
    .setColor(client.color)
    .setDescription(`${client.i18n.get(language, "player", "queue_end_desc")}`);

  if (channel) {
    const msg = await channel.send({ embeds: [embed] });
    setTimeout(async () => msg.delete(), client.config.bot.DELETE_MSG_TIMEOUT)
    clearMsg(client, channel, player)
  }

  /////////// Update Music Setup ///////////

  await client.UpdateMusic(player);

  /////////// Update Music Setup ///////////
};
