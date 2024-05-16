import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, Message, PermissionFlagsBits } from "discord.js";
import { Manager } from "../../manager.js";
import { EmbedBuilder } from "discord.js";
import { stripIndents } from "common-tags";
import fs from "fs";
import { CheckPermissionResultInterface, CheckPermissionServices } from "../../services/CheckPermissionService.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { Accessableby } from "../../structures/Command.js";
import { RatelimitReplyService } from "../../services/RatelimitReplyService.js";
import { RateLimitManager } from "@sapphire/ratelimits";
import { TopggServiceEnum } from "../../services/TopggService.js";
import { AutoReconnectBuilderService } from "../../services/AutoReconnectBuilderService.js";
const commandRateLimitManager = new RateLimitManager(1000);

export default class {
  async execute(client: Manager, message: Message) {
    if (message.author.bot || message.channel.type == ChannelType.DM) return;

    if (!client.isDatabaseConnected)
      return client.logger.warn(
        "DatabaseService",
        "The database is not yet connected so this event will temporarily not execute. Please try again later!"
      );

    let guildModel = await client.db.language.get(`${message.guild!.id}`);
    if (!guildModel) {
      guildModel = await client.db.language.set(`${message.guild!.id}`, client.config.bot.LANGUAGE);
    }

    const language = guildModel;

    let PREFIX = client.prefix;

    const mention = new RegExp(`^<@!?${client.user!.id}>( |)$`);

    const GuildPrefix = await client.db.prefix.get(`${message.guild!.id}`);
    if (GuildPrefix) PREFIX = GuildPrefix;
    else if (!GuildPrefix) PREFIX = String(await client.db.prefix.set(`${message.guild!.id}`, client.prefix));

    if (message.content.match(mention)) {
      const mention_embed = new EmbedBuilder()
        .setAuthor({
          name: `${client.getString(language, "event.message", "wel", {
            bot: message.guild!.members.me!.displayName,
          })}`,
        })
        .setColor(client.color).setDescription(stripIndents`
          ${client.getString(language, "event.message", "intro1", {
            bot: message.guild!.members.me!.displayName,
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
          `);
      await message.reply({ embeds: [mention_embed] });
      return;
    }
    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const prefixRegex = new RegExp(`^(<@!?${client.user!.id}>|${escapeRegex(PREFIX)})\\s*`);
    if (!prefixRegex.test(message.content)) return;
    const [matchedPrefix] = message.content.match(prefixRegex) as RegExpMatchArray;
    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/g);
    const cmd = args.shift()!.toLowerCase();

    const command = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd) as string);
    if (!command) return;

    const setup = await client.db.setup.get(String(message.guildId));

    if (setup && setup.channel == message.channelId) return;

    //////////////////////////////// Ratelimit check start ////////////////////////////////
    const ratelimit = commandRateLimitManager.acquire(`${message.author.id}@${command.name.join("-")}`);

    if (ratelimit.limited) {
      new RatelimitReplyService({
        client: client,
        language: language,
        message: message,
        time: Number(((ratelimit.expires - Date.now()) / 1000).toFixed(1)),
      }).reply();
      return;
    }

    ratelimit.consume();
    //////////////////////////////// Ratelimit check end ////////////////////////////////

    //////////////////////////////// Permission check start ////////////////////////////////
    const permissionChecker = new CheckPermissionServices();

    //Default permission
    const defaultPermissions = [
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.EmbedLinks,
      PermissionFlagsBits.ReadMessageHistory,
    ];
    const allCommandPermissions = [PermissionFlagsBits.ManageMessages];
    const musicPermissions = [PermissionFlagsBits.Speak, PermissionFlagsBits.Connect];
    const managePermissions = [PermissionFlagsBits.ManageChannels];

    async function respondError(permissionResult: CheckPermissionResultInterface) {
      const selfErrorString = `${client.getString(language, "error", "no_perms", {
        perm: permissionResult.result,
      })}`;
      const embed = new EmbedBuilder()
        .setDescription(
          permissionResult.channel == "Self"
            ? selfErrorString
            : `${client.getString(language, "error", "no_perms_channel", {
                perm: permissionResult.result,
                channel: permissionResult.channel,
              })}`
        )
        .setColor(client.color);
      const dmChannel = message.author.dmChannel == null ? await message.author.createDM() : message.author.dmChannel;
      dmChannel.send({
        embeds: [embed],
      });
    }

    const returnData = await permissionChecker.message(message, defaultPermissions);
    if (returnData.result !== "PermissionPass") return respondError(returnData);

    if (command.accessableby.includes(Accessableby.Manager)) {
      const returnData = await permissionChecker.message(message, managePermissions);
      if (returnData.result !== "PermissionPass") return respondError(returnData);
    } else if (command.category == "Music") {
      const returnData = await permissionChecker.message(message, musicPermissions);
      if (returnData.result !== "PermissionPass") return respondError(returnData);
    } else if (command.name.join("-") !== "help") {
      const returnData = await permissionChecker.message(message, allCommandPermissions);
      if (returnData.result !== "PermissionPass") return respondError(returnData);
    } else if (command.permissions.length !== 0) {
      const returnData = await permissionChecker.message(message, command.permissions);
      if (returnData.result !== "PermissionPass") return respondError(returnData);
    }
    //////////////////////////////// Permission check end ////////////////////////////////

    //////////////////////////////// Access check start ////////////////////////////////
    const premiumUser = await client.db.premium.get(message.author.id);
    const isHavePremium = !premiumUser || !premiumUser.isPremium;
    if (command.accessableby.includes(Accessableby.Owner) && message.author.id != client.owner)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(language, "error", "owner_only")}`)
            .setColor(client.color),
        ],
      });

    if (
      command.accessableby.includes(Accessableby.Admin) &&
      message.author.id != client.owner &&
      !client.config.bot.ADMIN.includes(message.author.id)
    )
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(language, "error", "no_perms", { perm: "dreamvast@admin" })}`)
            .setColor(client.color),
        ],
      });

    if (
      command.accessableby.includes(Accessableby.Manager) &&
      !message.member!.permissions.has(PermissionFlagsBits.ManageGuild)
    )
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(language, "error", "no_perms", { perm: "ManageGuild" })}`)
            .setColor(client.color),
        ],
      });

    if (
      command.accessableby.includes(Accessableby.Voter) &&
      isHavePremium &&
      client.topgg &&
      !client.config.bot.ADMIN.includes(message.author.id) &&
      message.author.id != client.owner
    ) {
      const voteChecker = await client.topgg.checkVote(message.author.id);
      if (voteChecker == TopggServiceEnum.ERROR) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: client.getString(language, "error", "topgg_error_author"),
          })
          .setDescription(client.getString(language, "error", "topgg_error_desc"))
          .setColor(client.color)
          .setTimestamp();
        return message.reply({ content: " ", embeds: [embed] });
      }

      if (voteChecker == TopggServiceEnum.UNVOTED) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: client.getString(language, "error", "topgg_vote_author"),
          })
          .setDescription(client.getString(language, "error", "topgg_vote_desc"))
          .setColor(client.color)
          .setTimestamp();
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel(client.getString(language, "error", "topgg_vote_button"))
            .setStyle(ButtonStyle.Link)
            .setURL(`https://top.gg/bot/${client.user?.id}/vote`)
        );
        return message.reply({ content: " ", embeds: [embed], components: [row] });
      }
    }

    if (
      command.accessableby.includes(Accessableby.Premium) &&
      isHavePremium &&
      !client.config.bot.ADMIN.includes(message.author.id) &&
      message.author.id != client.owner
    ) {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${client.getString(language, "error", "no_premium_author")}`,
          iconURL: client.user!.displayAvatarURL(),
        })
        .setDescription(`${client.getString(language, "error", "no_premium_desc")}`)
        .setColor(client.color)
        .setTimestamp();
      return message.reply({ content: " ", embeds: [embed] });
    }

    if (command.lavalink && client.lavalinkUsing.length == 0) {
      return message.reply({
        embeds: [
          new EmbedBuilder().setDescription(`${client.getString(language, "error", "no_node")}`).setColor(client.color),
        ],
      });
    }

    if (command.playerCheck) {
      const player = client.rainlink.players.get(message.guild!.id);
      const twentyFourBuilder = new AutoReconnectBuilderService(client);
      const is247 = await twentyFourBuilder.get(message.guild!.id);
      if (!player || (is247 && is247.twentyfourseven && player.queue.length == 0 && !player.queue.current))
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`${client.getString(language, "error", "no_player")}`)
              .setColor(client.color),
          ],
        });
    }

    if (command.sameVoiceCheck) {
      const { channel } = message.member!.voice;
      if (!channel || message.member!.voice.channel !== message.guild!.members.me!.voice.channel)
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`${client.getString(language, "error", "no_voice")}`)
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

      if (message.attachments.size !== 0) handler.addAttachment(message.attachments);

      client.logger.info(
        "CommandManager",
        `[${command.name.join("-")}] used by ${message.author.username} from ${message.guild?.name} (${
          message.guild?.id
        })`
      );

      command.execute(client, handler);
    } catch (error) {
      client.logger.error("CommandManager", error);
      message.reply({
        content: `${client.getString(language, "error", "unexpected_error")}\n ${error}`,
      });
    }
  }
}
