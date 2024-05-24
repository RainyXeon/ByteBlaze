import { Manager } from "../../manager.js";
import { EmbedBuilder, Guild } from "discord.js";

export default class {
  async execute(client: Manager, guild: Guild) {
    client.logger.info("GuildDelete", `Left guild ${guild.name} @ ${guild.id}`);
    const language = client.config.bot.LANGUAGE;
    client.guilds.cache.delete(`${guild!.id}`);
    if (!client.config.utilities.GUILD_LOG_CHANNEL) return;
    const eventChannel = await client.channels
      .fetch(client.config.utilities.GUILD_LOG_CHANNEL)
      .catch(() => undefined);
    if (!eventChannel || !eventChannel.isTextBased()) return;
    const owner = await guild.fetchOwner();
    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${client.i18n.get(language, "event.guild", "leave_title")}`,
      })
      .addFields([
        {
          name: `${client.i18n.get(language, "event.guild", "guild_name")}`,
          value: String(guild.name),
        },
        {
          name: `${client.i18n.get(language, "event.guild", "guild_id")}`,
          value: String(guild.id),
        },
        {
          name: `${client.i18n.get(language, "event.guild", "guild_owner")}`,
          value: `${owner.displayName} [ ${guild.ownerId} ]`,
        },
        {
          name: `${client.i18n.get(language, "event.guild", "guild_member_count")}`,
          value: `${guild.memberCount}`,
        },
        {
          name: `${client.i18n.get(language, "event.guild", "guild_creation_date")}`,
          value: `${guild.createdAt}`,
        },
        {
          name: `${client.i18n.get(language, "event.guild", "current_server_count")}`,
          value: `${client.guilds.cache.size}`,
        },
      ])
      .setTimestamp()
      .setColor(client.color);

    eventChannel.messages.channel.send({ embeds: [embed] }).catch(() => undefined);
  }
}
