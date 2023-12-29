import {
  PermissionsBitField,
  InteractionType,
  CommandInteraction,
  EmbedBuilder,
  CommandInteractionOptionResolver,
} from "discord.js";
import { Manager } from "../../manager.js";
import {
  GlobalInteraction,
  NoAutoInteraction,
} from "../../@types/Interaction.js";
import { Accessableby } from "../../@types/Command.js";

/**
 * @param {GlobalInteraction} interaction
 */

export default class {
  async execute(client: Manager, interaction: GlobalInteraction) {
    if (
      interaction.isCommand() ||
      interaction.isContextMenuCommand() ||
      interaction.isModalSubmit() ||
      interaction.isChatInputCommand() ||
      interaction.isAutocomplete()
    ) {
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
        Number(interaction.type) ==
          InteractionType.ApplicationCommandAutocomplete &&
        (command as any).autocomplete !== undefined
      ) {
        try {
          (command as any).autocomplete(client, interaction, language);
        } catch (error) {
          client.logger.log({
            level: "error",
            message: error,
          });
        }
        return;
      }

      const msg_cmd = [
        `[COMMAND] ${command.name[0]}`,
        `${command.name[1] || ""}`,
        `${command.name[2] || ""}`,
        `used by ${interaction.user.tag} from ${interaction.guild.name} (${interaction.guild.id})`,
      ];

      client.logger.info(`${msg_cmd.join(" ")}`);

      if (
        command.accessableby == Accessableby.Manager &&
        !(interaction.member!.permissions as Readonly<PermissionsBitField>).has(
          PermissionsBitField.Flags.ManageGuild
        )
      )
        return (interaction as NoAutoInteraction).reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "utilities", "lang_perm")}`
              )
              .setColor(client.color),
          ],
        });

      if (command.lavalink && client.lavalinkUsing.length == 0) {
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

      if (
        command.accessableby == Accessableby.Owner &&
        interaction.user.id != client.owner
      )
        return (interaction as NoAutoInteraction).reply(
          `${client.i18n.get(language, "interaction", "owner_only")}`
        );

      if (command.accessableby == Accessableby.Premium) {
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

      try {
        command.run(interaction, client, language);
      } catch (error) {
        client.logger.log({
          level: "error",
          message: error,
        });
      }
    }
  }
}
