import { Manager } from "../../manager.js";
import { EmbedBuilder, Guild } from "discord.js";

export default class {
  async execute(client: Manager, guild: Guild) {
    client.logger.info("GuildDelete", `Left guild ${guild.name} @ ${guild.id}`);
    const language = client.config.bot.LANGUAGE;
    client.guilds.cache.delete(`${guild!.id}`);
    if (!client.config.features.GUILD_LOG_CHANNEL) return;
    try {
      const eventChannel = await client.channels.fetch(client.config.features.GUILD_LOG_CHANNEL).catch(() => undefined);
      if (!eventChannel || !eventChannel.isTextBased()) return;
      const owner = await guild.fetchOwner();
      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${client.getString(language, "event.guild", "leave_title")}`,
        })
        .addFields([
          {
            name: `${client.getString(language, "event.guild", "guild_name")}`,
            value: String(guild.name),
          },
          {
            name: `${client.getString(language, "event.guild", "guild_id")}`,
            value: String(guild.id),
          },
          {
            name: `${client.getString(language, "event.guild", "guild_owner")}`,
            value: `${owner.displayName} [ ${guild.ownerId} ]`,
          },
          {
            name: `${client.getString(language, "event.guild", "guild_member_count")}`,
            value: `${guild.memberCount}`,
          },
          {
            name: `${client.getString(language, "event.guild", "guild_creation_date")}`,
            value: `${guild.createdAt}`,
          },
          {
            name: `${client.getString(language, "event.guild", "current_server_count")}`,
            value: `${client.guilds.cache.size}`,
          },
        ])
        .setTimestamp()
        .setColor(client.color);

      eventChannel.messages.channel.send({ embeds: [embed] });
    } catch (err) {}
  }
}
