import {
  PermissionsBitField,
  CommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  ApplicationCommandOptionType,
  Attachment,
  GuildMember,
  ChatInputCommandInteraction,
} from "discord.js";
import { Manager } from "../../manager.js";
import {
  GlobalInteraction,
  NoAutoInteraction,
} from "../../@types/Interaction.js";
import { CheckPermissionServices } from "../../services/CheckPermissionService.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { Accessableby } from "../../structures/Command.js";
import { ConvertToMention } from "../../utilities/ConvertToMention.js";
import { RatelimitReplyService } from "../../services/RatelimitReplyService.js";
import { RateLimitManager } from "@sapphire/ratelimits";
import { AutoCompleteService } from "../../services/AutoCompleteService.js";
const commandRateLimitManager = new RateLimitManager(1000);

/**
 * @param {GlobalInteraction} interaction
 */

export default class {
  async execute(client: Manager, interaction: GlobalInteraction) {
    if (interaction.isAutocomplete())
      return new AutoCompleteService(client, interaction);
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.guild || interaction.user.bot) return;

    if (!client.isDatabaseConnected)
      return client.logger.warn(
        "The database is not yet connected so this event will temporarily not execute. Please try again later!"
      );

    let guildModel = await client.db.language.get(`${interaction.guild.id}`);
    if (!guildModel) {
      guildModel = await client.db.language.set(
        `${interaction.guild.id}`,
        client.config.bot.LANGUAGE
      );
    }

    const language = guildModel;

    let subCommandName = "";
    try {
      subCommandName = interaction.options.getSubcommand();
    } catch {}
    let subCommandGroupName;
    try {
      subCommandGroupName = interaction.options.getSubcommandGroup();
    } catch {}

    const commandNameArray = [];

    if (interaction.commandName) commandNameArray.push(interaction.commandName);
    if (subCommandName.length !== 0 && !subCommandGroupName)
      commandNameArray.push(subCommandName);
    if (subCommandGroupName) {
      commandNameArray.push(subCommandGroupName);
      commandNameArray.push(subCommandName);
    }

    const command = client.commands.get(commandNameArray.join("-"));

    if (!command) return commandNameArray.length == 0;

    //////////////////////////////// Ratelimit check start ////////////////////////////////
    const ratelimit = commandRateLimitManager.acquire(
      `${interaction.user.id}@${command.name.join("-")}`
    );

    if (ratelimit.limited) {
      new RatelimitReplyService({
        client: client,
        language: language,
        interaction: interaction,
        time: Number(((ratelimit.expires - Date.now()) / 1000).toFixed(1)),
      }).reply();
      return;
    } else if (ratelimit.limited) return;

    ratelimit.consume();
    //////////////////////////////// Ratelimit check end ////////////////////////////////

    //////////////////////////////// Permission check start ////////////////////////////////
    const permissionChecker = new CheckPermissionServices();
    const defaultPermissions = [PermissionFlagsBits.ManageMessages];

    const musicPermissions = [
      PermissionFlagsBits.Speak,
      PermissionFlagsBits.Connect,
    ];

    const managePermissions = [PermissionFlagsBits.ManageChannels];

    async function respondError(
      interaction: ChatInputCommandInteraction | CommandInteraction,
      permission: string
    ) {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "interaction", "no_perms", {
            perm: permission,
          })}`
        )
        .setColor(client.color);
      await interaction.reply({
        embeds: [embed],
      });
    }

    if (command.name[0] !== "help") {
      const returnData = await permissionChecker.interaction(
        interaction,
        defaultPermissions
      );
      if (returnData !== "PermissionPass")
        return respondError(interaction, returnData);
    }
    if (command.category.toLocaleLowerCase() == "music") {
      const returnData = await permissionChecker.interaction(
        interaction,
        musicPermissions
      );
      if (returnData !== "PermissionPass")
        return respondError(interaction, returnData);
    }
    if (command.accessableby == Accessableby.Manager) {
      const returnData = await permissionChecker.interaction(
        interaction,
        managePermissions
      );
      if (returnData !== "PermissionPass")
        return respondError(interaction, returnData);
    }
    //////////////////////////////// Permission check end ////////////////////////////////

    if (
      command.accessableby == Accessableby.Manager &&
      !(interaction.member!.permissions as Readonly<PermissionsBitField>).has(
        PermissionsBitField.Flags.ManageGuild
      )
    )
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "utilities", "lang_perm")}`
            )
            .setColor(client.color),
        ],
      });

    if (command.lavalink && client.lavalinkUsing.length == 0) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.i18n.get(language, "music", "no_node")}`)
            .setColor(client.color),
        ],
      });
    }

    if (
      command.accessableby == Accessableby.Owner &&
      interaction.user.id != client.owner
    )
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "interaction", "owner_only")}`
            )
            .setColor(client.color),
        ],
      });

    if (command.accessableby == Accessableby.Premium) {
      const user = client.premiums.get(interaction.user.id);
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
        return interaction.reply({
          content: " ",
          embeds: [embed],
        });
      }
    }

    if (command.playerCheck) {
      const player = client.manager.players.get(interaction.guild!.id);
      if (!player)
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "noplayer", "no_player")}`
              )
              .setColor(client.color),
          ],
        });
    }

    if (command.sameVoiceCheck) {
      const { channel } = (interaction.member as GuildMember)!.voice;
      if (
        !channel ||
        (interaction.member as GuildMember)!.voice.channel !==
          interaction.guild!.members.me!.voice.channel
      )
        return (interaction as NoAutoInteraction).reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "noplayer", "no_voice")}`
              )
              .setColor(client.color),
          ],
        });
    }

    try {
      const args = [];
      let attachments: Attachment | undefined;

      for (const data of interaction.options.data) {
        const check = new ConvertToMention().execute({
          type: data.type,
          value: String(data.value),
        });
        if (check !== "error") {
          args.push(check);
        } else if (data.type == ApplicationCommandOptionType.Attachment) {
          attachments = data.attachment;
        } else {
          if (data.value) args.push(String(data.value));
          if (data.options) {
            for (const optionData of data.options) {
              if (optionData.value) args.push(String(optionData.value));
            }
          }
        }
      }

      const handler = new CommandHandler({
        interaction: interaction as CommandInteraction,
        language: language,
        client: client,
        args: args,
        prefix: "/",
      });

      if (attachments) handler.addSingleAttachment(attachments);

      client.logger.info(
        `[COMMAND] ${commandNameArray.join("-")} used by ${
          interaction.user.username
        } from ${interaction.guild.name} (${interaction.guild.id})`
      );

      command.execute(client, handler);
    } catch (error) {
      client.logger.log({
        level: "error",
        message: error,
      });
    }
  }
}
