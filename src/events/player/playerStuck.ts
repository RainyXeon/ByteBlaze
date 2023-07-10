import { KazagumoPlayer } from "kazagumo";
import { Manager } from "../../manager.js";
import { TextChannel, EmbedBuilder } from "discord.js";
import { TrackStuckEvent } from "shoukaku";

export default async (client: Manager, player: KazagumoPlayer, data: TrackStuckEvent) => {
  const guild = await client.guilds.cache.get(player.guildId)

  const channel = client.channels.cache.get(player.textId) as TextChannel
  if (!channel) return;

  let guildModel = await client.db.get(`language.guild_${channel.guild.id}`)
  if (!guildModel) {
      guildModel = await client.db.set(`language.guild_${channel.guild.id}`, "en")
  }

  const language = guildModel;

  /////////// Update Music Setup ///////////

  await client.UpdateMusic(player);

  /////////// Update Music Setup ///////////

  const embed = new EmbedBuilder()
      .setColor(client.color)
      .setDescription(`${client.i18n.get(language, "player", "error_desc")}`);

  channel.send({ embeds: [embed] });

  client.logger.error(`Track Stuck in ${guild!.name} / ${player.guildId}. Auto-Leaved!`);
  await player.destroy();
  if (client.websocket) client.websocket.send(JSON.stringify({ op: "player_destroy", guild: player.guildId }))

}