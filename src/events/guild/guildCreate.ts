import { stripIndents } from "common-tags";
import { Manager } from "../../manager.js";
import { EmbedBuilder, Guild } from "discord.js";
import fs from "fs";

export default class {
  async execute(client: Manager, guild: Guild) {
    client.logger.info("GuildCreate", `Joined guild ${guild.name} @ ${guild.id}`);
    const owner = await guild.fetchOwner();
    const language = client.config.bot.LANGUAGE;
    client.guilds.cache.set(`${guild!.id}`, guild);
    try {
      let PREFIX = client.prefix;

      const GuildPrefix = await client.db.prefix.get(`${guild!.id}`);
      if (GuildPrefix) PREFIX = GuildPrefix;
      else if (!GuildPrefix) PREFIX = String(await client.db.prefix.set(`${guild!.id}`, client.prefix));

      const userDm = await owner.createDM(true);
      userDm.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(
              `${client.getString(language, "event.guild", "join_dm_title", {
                username: String(client.user?.username),
              })}`
            )
            .setDescription(
              stripIndents`
              ${client.getString(language, "event.message", "intro1", {
                bot: String(client.user?.displayName),
              })}
              ${client.getString(language, "event.message", "intro2")}
              ${client.getString(language, "event.message", "intro3")}
              ${client.getString(language, "event.message", "prefix", {
                prefix: `\`${PREFIX}\` or \`/\``,
              })}
              ${client.getString(language, "event.message", "help1", {
                help: `\`${PREFIX}help\` or \`/help\``,
              })}
              ${client.getString(language, "event.message", "help2", {
                botinfo: `\`${PREFIX}status\` or \`/status\``,
              })}
              ${client.getString(language, "event.message", "ver", {
                botver: client.metadata.version,
              })}
              ${client.getString(language, "event.message", "djs", {
                djsver: JSON.parse(await fs.readFileSync("package.json", "utf-8")).dependencies["discord.js"],
              })}
              ${client.getString(language, "event.message", "lavalink", {
                aver: client.metadata.autofix,
              })}
              ${client.getString(language, "event.message", "codename", {
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
      const eventChannel = await client.channels.fetch(client.config.features.GUILD_LOG_CHANNEL).catch(() => undefined);
      if (!eventChannel || !eventChannel.isTextBased()) return;
      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${client.getString(language, "event.guild", "joined_title")}`,
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
