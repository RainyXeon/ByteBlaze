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
    let PREFIX = client.prefix;

    const GuildPrefix = await client.db.prefix.get(`${guild!.id}`);
    if (GuildPrefix) PREFIX = GuildPrefix;
    else if (!GuildPrefix)
      PREFIX = String(await client.db.prefix.set(`${guild!.id}`, client.prefix));

    const userDm = await owner.createDM(true).catch(() => null);
    const dmEmbed = new EmbedBuilder()
      .setTitle(
        `${client.i18n.get(language, "event.guild", "join_dm_title", {
          username: String(client.user?.username),
        })}`
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
            djsver: JSON.parse(fs.readFileSync("package.json", "utf-8")).dependencies["discord.js"],
          })}
          ${client.i18n.get(language, "event.message", "lavalink", {
            aver: client.metadata.autofix,
          })}
          ${client.i18n.get(language, "event.message", "codename", {
            codename: client.metadata.codename,
          })}
        `
      )
      .setColor(client.color);
    if (userDm) userDm.send({ embeds: [dmEmbed] }).catch(() => {});

    if (!client.config.utilities.GUILD_LOG_CHANNEL) return;
    const eventChannel = await client.channels
      .fetch(client.config.utilities.GUILD_LOG_CHANNEL)
      .catch(() => undefined);
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

    eventChannel.messages.channel.send({ embeds: [embed] }).catch(() => null);
  }
}
