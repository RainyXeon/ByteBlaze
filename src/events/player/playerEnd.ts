import { KazagumoPlayer } from "kazagumo";
import { Manager } from "../../manager.js";
import { EmbedBuilder, Client, TextChannel } from "discord.js";

export default async (client: Manager, player: KazagumoPlayer) => {
  const guild = await client.guilds.cache.get(player.guildId);
  client.logger.info(`Player End in @ ${guild!.name} / ${player.guildId}`);

  if (client.websocket) {
    const song = player.queue.previous;

    await client.websocket.send(
      JSON.stringify({
        op: "player_end",
        guild: player.guildId,
        track: song
          ? {
              title: song.title,
              uri: song.uri,
              length: song.length,
              thumbnail: song.thumbnail,
              author: song.author,
              requester: song.requester,
            }
          : null,
      }),
    );
  }

  let data = await client.db.get(`autoreconnect.guild_${player.guildId}`);
  const channel = client.channels.cache.get(player.textId) as TextChannel;
  if (!channel) return;

  if (data) return;

  if (player.queue.length) return;

  let guildModel = await client.db.get(`language.guild_${player.guildId}`);
  if (!guildModel) {
    guildModel = await client.db.set(
      `language.guild_${player.guildId}`,
      client.config.bot.LANGUAGE,
    );
  }

  const language = guildModel;

  /////////// Update Music Setup ///////////

  await client.UpdateMusic(player);

  /////////// Update Music Setup ///////////

  const embed = new EmbedBuilder()
    .setColor(client.color)
    .setDescription(`${client.i18n.get(language, "player", "queue_end_desc")}`);

  if (channel) channel.send({ embeds: [embed] });
  player.destroy();
  if (client.websocket)
    client.websocket.send(
      JSON.stringify({ op: "player_destroy", guild: player.guildId }),
    );
};
