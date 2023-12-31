import { ChannelType, Message, PermissionFlagsBits } from "discord.js";
import { Manager } from "../../manager.js";
import { EmbedBuilder } from "discord.js";
import { stripIndents } from "common-tags";
import fs from "fs";
import { CheckPermissionServices } from "../../utilities/CheckPermissionServices.js";
import { CommandHandler } from "../../@base/CommandHandler.js";
import { Accessableby } from "../../@base/Command.js";

export default class {
  async execute(client: Manager, message: Message) {
    if (message.author.bot || message.channel.type == ChannelType.DM) return;

    if (!client.isDatabaseConnected)
      return client.logger.warn(
        "The database is not yet connected so this event will temporarily not execute. Please try again later!"
      );

    let guildModel = await client.db.language.get(`${message.guild!.id}`);
    if (!guildModel) {
      guildModel = await client.db.language.set(
        `${message.guild!.id}`,
        client.config.bot.LANGUAGE
      );
    }

    const language = guildModel;

    let PREFIX = client.prefix;

    const mention = new RegExp(`^<@!?${client.user!.id}>( |)$`);

    const GuildPrefix = await client.db.prefix.get(`${message.guild!.id}`);
    if (GuildPrefix) PREFIX = GuildPrefix;
    else if (!GuildPrefix) {
      await client.db.language.set(`${message.guild!.id}`, client.prefix);
      const newPrefix = await client.db.language.get(`${message.guild!.id}`);
      PREFIX = String(newPrefix);
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
    const args = message.content
      .slice(matchedPrefix.length)
      .trim()
      .split(/ +/g);
    const cmd = args.shift()!.toLowerCase();

    const command =
      client.commands.get(cmd) ||
      client.commands.get(client.aliases.get(cmd) as string);
    if (!command) return;

    //////////////////////////////// Permission check start ////////////////////////////////
    const permissionChecker = new CheckPermissionServices();
    const defaultPermissions = [
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.EmbedLinks,
    ];

    const allCommandPermissions = [PermissionFlagsBits.ManageMessages];

    const musicPermissions = [
      PermissionFlagsBits.Speak,
      PermissionFlagsBits.Connect,
    ];

    const managePermissions = [PermissionFlagsBits.ManageChannels];

    async function respondError(permission: string) {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "interaction", "no_perms", {
            perm: permission,
          })}`
        )
        .setColor(client.color);
      const dmChannel =
        message.author.dmChannel == null
          ? await message.author.createDM()
          : message.author.dmChannel;
      dmChannel.send({
        embeds: [embed],
      });
    }

    const returnData = await permissionChecker.message(
      message,
      defaultPermissions
    );
    if (returnData !== "PermissionPass") return respondError(returnData);

    if (command.accessableby == Accessableby.Manager) {
      const returnData = await permissionChecker.message(
        message,
        managePermissions
      );
      if (returnData !== "PermissionPass") return respondError(returnData);
    } else if (command.category == "Music") {
      const returnData = await permissionChecker.message(
        message,
        musicPermissions
      );
      if (returnData !== "PermissionPass") return respondError(returnData);
    } else if (command.name.join("-") !== "help") {
      const returnData = await permissionChecker.message(
        message,
        allCommandPermissions
      );
      if (returnData !== "PermissionPass") return respondError(returnData);
    }
    //////////////////////////////// Permission check end ////////////////////////////////

    //////////////////////////////// Access check start ////////////////////////////////
    if (
      command.accessableby == Accessableby.Owner &&
      message.author.id != client.owner
    )
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
      command.accessableby == Accessableby.Manager &&
      !message.member!.permissions.has(PermissionFlagsBits.ManageGuild)
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
      if (command.accessableby == Accessableby.Premium) {
        const user = client.premiums.get(message.author.id);
        if (!user || !user.isPremium) {
          const embed = new EmbedBuilder()
            .setAuthor({
              name: `${client.i18n.get(
                language,
                "nopremium",
                "premium_author"
              )}`,
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

    if (command.lavalink && client.lavalinkUsing.length == 0) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.i18n.get(language, "music", "no_node")}`)
            .setColor(client.color),
        ],
      });
    }

    //////////////////////////////// Access check end ////////////////////////////////

    try {
      const handler = new CommandHandler({
        message: message,
        language: language,
        client: client,
        args: args,
        prefix: PREFIX || client.prefix || "d!",
      });

      command.execute(client, handler);
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
}
