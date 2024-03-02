import { stripIndents } from "common-tags";
import { Manager } from "../../manager.js";
import { EmbedBuilder, Guild } from "discord.js";
import fs from "fs";

export default class {
  async execute(client: Manager, guild: Guild) {
    client.logger.info(`Joined guild ${guild.name} @ ${guild.id}`);
    const owner = await guild.fetchOwner();
    const language = client.config.bot.LANGUAGE;

    try {
      let PREFIX = client.prefix;

      const GuildPrefix = await client.db.prefix.get(`${guild!.id}`);
      if (GuildPrefix) PREFIX = GuildPrefix;
      else if (!GuildPrefix)
        PREFIX = String(
          await client.db.prefix.set(`${guild!.id}`, client.prefix)
        );

      const userDm = await owner.createDM(true);
      userDm.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(
              `${client.i18n.get(language, "event.guild", "join_dm_title", { username: String(client.user?.username) })}`
            )
            .setDescription(
              stripIndents`
              ${client.i18n.get(language, "event.message", "intro1", {
                bot: String(client.user?.displayName),
              })}
              ${client.i18n.get(language, "event.message", "intro2")}
              ${client.i18n.get(language, "event.message", "intro3")}
              ${client.i18n.get(language, "event.message", "prefix", {
                prefix: `\`${PREFIX}\` or \`/\``,
              })}
              ${client.i18n.get(language, "event.message", "help1", {
                help: `\`${PREFIX}help\` or \`/help\``,
              })}
              ${client.i18n.get(language, "event.message", "help2", {
                botinfo: `\`${PREFIX}status\` or \`/status\``,
              })}
              ${client.i18n.get(language, "event.message", "ver", {
                botver: client.metadata.version,
              })}
              ${client.i18n.get(language, "event.message", "djs", {
                djsver: JSON.parse(
                  await fs.readFileSync("package.json", "utf-8")
                ).dependencies["discord.js"],
              })}
              ${client.i18n.get(language, "event.message", "lavalink", {
                aver: client.metadata.autofix,
              })}
              ${client.i18n.get(language, "event.message", "codename", {
                codename: client.metadata.codename,
              })}
            `
            )
            .setColor(client.color),
        ],
      });
    } catch (err) {}

    if (!client.config.features.GUILD_LOG_CHANNEL) return;
    try {
      const eventChannel = await client.channels.fetch(
        client.config.features.GUILD_LOG_CHANNEL
      );
      if (!eventChannel || !eventChannel.isTextBased()) return;
      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${client.i18n.get(language, "event.guild", "joined_title")}`,
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

      eventChannel.messages.channel.send({ embeds: [embed] });
    } catch (err) {}
  }
}
