import { ChannelType, Message } from "discord.js";
import { Manager } from "../../manager.js";
import { PermissionsBitField, EmbedBuilder } from "discord.js";
import { stripIndents } from "common-tags";
import fs from "fs";

export default async (client: Manager, message: Message) => {
  if (message.author.bot || message.channel.type == ChannelType.DM) return;

  if (!client.is_db_connected)
    return client.logger.warn(
      "The database is not yet connected so this event will temporarily not execute. Please try again later!"
    );

  let guildModel = await client.db.get(`language.guild_${message.guild!.id}`);
  if (!guildModel) {
    guildModel = await client.db.set(
      `language.guild_${message.guild!.id}`,
      client.config.bot.LANGUAGE
    );
  }

  const language = guildModel;

  let PREFIX = client.prefix;

  const mention = new RegExp(`^<@!?${client.user!.id}>( |)$`);

  const GuildPrefix = await client.db.get(`prefix.guild_${message.guild!.id}`);
  if (GuildPrefix) PREFIX = GuildPrefix;
  else if (!GuildPrefix) {
    await client.db.set(`prefix.guild_${message.guild!.id}`, client.prefix);
    const newPrefix = await client.db.get(`prefix.guild_${message.guild!.id}`);
    PREFIX = newPrefix;
  }

  if (message.content.match(mention)) {
    const mention_embed = new EmbedBuilder()
      .setAuthor({
        name: `${client.i18n.get(language, "help", "wel", {
          bot: message.guild!.members.me!.displayName,
        })}`,
      })
      .setColor(client.color).setDescription(stripIndents`
        ${client.i18n.get(language, "help", "intro1", {
          bot: message.guild!.members.me!.displayName,
        })}
        ${client.i18n.get(language, "help", "intro2")}
        ${client.i18n.get(language, "help", "intro3")}
        ${client.i18n.get(language, "help", "prefix", {
          prefix: `\`${PREFIX}\``,
        })}
        ${client.i18n.get(language, "help", "help1", {
          help: `\`${PREFIX}help\` / \`/help\``,
        })}
        ${client.i18n.get(language, "help", "help2", {
          botinfo: `\`${PREFIX}status\` / \`/status\``,
        })}
        ${client.i18n.get(language, "help", "ver", {
          botver: client.metadata.version,
        })}
        ${client.i18n.get(language, "help", "djs", {
          djsver: JSON.parse(await fs.readFileSync("package.json", "utf-8"))
            .dependencies["discord.js"],
        })}
        ${client.i18n.get(language, "help", "lavalink", {
          aver: client.metadata.autofix,
        })}
        ${client.i18n.get(language, "help", "codename", {
          codename: client.metadata.codename,
        })}
        `);
    await message.reply({ embeds: [mention_embed] });
    return;
  }
  const escapeRegex = (str: string) =>
    str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const prefixRegex = new RegExp(
    `^(<@!?${client.user!.id}>|${escapeRegex(PREFIX)})\\s*`
  );
  if (!prefixRegex.test(message.content)) return;
  const [matchedPrefix] = message.content.match(
    prefixRegex
  ) as RegExpMatchArray;
  const args = message.content.slice(matchedPrefix.length).trim().split(/ +/g);
  const cmd = args.shift()!.toLowerCase();

  const command =
    client.commands.get(cmd) ||
    client.commands.get(client.aliases.get(cmd) as string);
  if (!command) return;

  if (
    !message.guild!.members.me!.permissions.has(
      PermissionsBitField.Flags.SendMessages
    )
  )
    return await message.author.dmChannel!.send({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "interaction", "no_perms")}`
          )
          .setColor(client.color),
      ],
    });
  if (
    !message.guild!.members.me!.permissions.has(
      PermissionsBitField.Flags.ViewChannel
    )
  )
    return;
  if (
    !message.guild!.members.me!.permissions.has(
      PermissionsBitField.Flags.EmbedLinks
    )
  )
    return await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "interaction", "no_perms")}`
          )
          .setColor(client.color),
      ],
    });

  if (command.owner && message.author.id != client.owner)
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "interaction", "owner_only")}`
          )
          .setColor(client.color),
      ],
    });

  if (
    command.isManager &&
    !message.member!.permissions.has(PermissionsBitField.Flags.ManageGuild)
  )
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "utilities", "lang_perm")}`
          )
          .setColor(client.color),
      ],
    });

  try {
    if (command.premium) {
      const user = client.premiums.get(message.author.id);
      if (!user || !user.isPremium) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${client.i18n.get(language, "nopremium", "premium_author")}`,
            iconURL: client.user!.displayAvatarURL(),
          })
          .setDescription(
            `${client.i18n.get(language, "nopremium", "premium_desc")}`
          )
          .setColor(client.color)
          .setTimestamp();

        return message.reply({ content: " ", embeds: [embed] });
      }
    }
  } catch (err) {
    client.logger.error(err);
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "nopremium", "premium_error")}`
          )
          .setColor(client.color),
      ],
    });
  }

  if (command.lavalink && client.lavalink_using.length == 0) {
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`${client.i18n.get(language, "music", "no_node")}`)
          .setColor(client.color),
      ],
    });
  }

  if (command) {
    try {
      command.run(client, message, args, language, PREFIX);
    } catch (error) {
      client.logger.error(error);
      message.reply({
        content: `${client.i18n.get(
          language,
          "interaction",
          "error"
        )}\n ${error}`,
      });
    }
  }
};
