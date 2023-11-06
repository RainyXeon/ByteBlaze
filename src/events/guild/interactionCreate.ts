import {
  PermissionsBitField,
  InteractionType,
  CommandInteraction,
  EmbedBuilder,
  CommandInteractionOptionResolver,
  AutocompleteInteraction,
} from "discord.js";
import { Manager } from "../../manager.js";
import {
  AutocompleteInteractionChoices,
  GlobalInteraction,
  NoAutoInteraction,
} from "../../@types/Interaction.js";
import yts from "yt-search";

/**
 * @param {GlobalInteraction} interaction
 */

export default async (client: Manager, interaction: GlobalInteraction) => {
  if (
    interaction.isCommand() ||
    interaction.isContextMenuCommand() ||
    interaction.isModalSubmit() ||
    interaction.isChatInputCommand() ||
    interaction.isAutocomplete()
  ) {
    if (!interaction.guild || interaction.user.bot) return;

    if (!client.is_db_connected)
      return client.logger.warn(
        "The database is not yet connected so this event will temporarily not execute. Please try again later!"
      );

    let guildModel = await client.db.get(
      `language.guild_${interaction.guild.id}`
    );
    if (!guildModel) {
      guildModel = await client.db.set(
        `language.guild_${interaction.guild.id}`,
        client.config.bot.LANGUAGE
      );
    }

    const language = guildModel;

    let subCommandName = "";
    try {
      subCommandName = (
        (interaction as CommandInteraction)
          .options as CommandInteractionOptionResolver
      ).getSubcommand();
    } catch {}
    let subCommandGroupName = "";
    try {
      subCommandGroupName = (
        (interaction as CommandInteraction)
          .options as CommandInteractionOptionResolver
      ).getSubcommandGroup()!;
    } catch {}

    const command = client.slash.find((command) => {
      switch (command.name.length) {
        case 1:
          return (
            command.name[0] == (interaction as CommandInteraction).commandName
          );
        case 2:
          return (
            command.name[0] ==
              (interaction as CommandInteraction).commandName &&
            command.name[1] == subCommandName
          );
        case 3:
          return (
            command.name[0] ==
              (interaction as CommandInteraction).commandName &&
            command.name[1] == subCommandGroupName &&
            command.name[2] == subCommandName
          );
      }
    });

    if (!command) return;

    if (
      Number(interaction.type) == InteractionType.ApplicationCommandAutocomplete
    )
      return client.emit("autoComplete", interaction, language, command);

    const msg_cmd = [
      `[COMMAND] ${command.name[0]}`,
      `${command.name[1] || ""}`,
      `${command.name[2] || ""}`,
      `used by ${interaction.user.tag} from ${interaction.guild.name} (${interaction.guild.id})`,
    ];

    client.logger.info(`${msg_cmd.join(" ")}`);

    if (command.owner && interaction.user.id != client.owner)
      return (interaction as NoAutoInteraction).reply(
        `${client.i18n.get(language, "interaction", "owner_only")}`
      );

    try {
      if (command.premium) {
        const user = client.premiums.get(interaction.user.id);
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

          return (interaction as NoAutoInteraction).reply({
            content: " ",
            embeds: [embed],
          });
        }
      }
    } catch (err) {
      client.logger.error(err);
      return (interaction as NoAutoInteraction).reply({
        content: `${client.i18n.get(language, "nopremium", "premium_error")}`,
      });
    }

    if (
      !interaction.guild.members.me!.permissions.has(
        PermissionsBitField.Flags.SendMessages
      )
    )
      return interaction.user.dmChannel!.send({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "interaction", "no_perms")}`
            )
            .setColor(client.color),
        ],
      });
    if (
      !interaction.guild.members.me!.permissions.has(
        PermissionsBitField.Flags.ViewChannel
      )
    )
      return;
    if (
      !interaction.guild.members.me!.permissions.has(
        PermissionsBitField.Flags.EmbedLinks
      )
    )
      return (interaction as NoAutoInteraction).reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "interaction", "no_perms")}`
            )
            .setColor(client.color),
        ],
      });
    if (!((interaction as CommandInteraction).commandName == "help")) {
      if (
        !interaction.guild.members.me!.permissions.has(
          PermissionsBitField.Flags.Speak
        )
      )
        return (interaction as NoAutoInteraction).reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "interaction", "no_perms")}`
              )
              .setColor(client.color),
          ],
        });
      if (
        !interaction.guild.members.me!.permissions.has(
          PermissionsBitField.Flags.Connect
        )
      )
        return (interaction as NoAutoInteraction).reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "interaction", "no_perms")}`
              )
              .setColor(client.color),
          ],
        });
      if (
        !interaction.guild.members.me!.permissions.has(
          PermissionsBitField.Flags.ManageMessages
        )
      )
        return (interaction as NoAutoInteraction).reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "interaction", "no_perms")}`
              )
              .setColor(client.color),
          ],
        });
      if (
        !interaction.guild.members.me!.permissions.has(
          PermissionsBitField.Flags.ManageChannels
        )
      )
        return await (interaction as NoAutoInteraction).reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "interaction", "no_perms")}`
              )
              .setColor(client.color),
          ],
        });
    }

    if (
      !(interaction.member!.permissions as Readonly<PermissionsBitField>).has(
        PermissionsBitField.Flags.ManageGuild
      )
    )
      return (interaction as NoAutoInteraction).reply(
        `${client.i18n.get(language, "utilities", "lang_perm")}`
      );

    if (command.lavalink) {
      if (client.lavalink_using.length == 0)
        return (interaction as NoAutoInteraction).reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "music", "no_node")}`
              )
              .setColor(client.color),
          ],
        });
    }

    if (!command) return;
    if (command) {
      try {
        command.run(interaction, client, language);
      } catch (error) {
        client.logger.log({
          level: "error",
          message: error,
        });
        return (interaction as NoAutoInteraction).editReply({
          content: `${client.i18n.get(
            language,
            "interaction",
            "error"
          )}\n ${error}`,
        });
      }
    }
  }
};
