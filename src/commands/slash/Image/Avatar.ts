import { CommandInteraction } from "discord.js";
import { Manager } from "../../../manager.js";
import { EmbedBuilder, ApplicationCommandOptionType } from "discord.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";

export default class implements SlashCommand {
  name = ["avatar"];
  description = "Show your or someone else's profile picture";
  category = "Image";
  accessableby = Accessableby.Member;
  lavalink = false;
  options = [
    {
      name: "user",
      description: "Type your user here",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ];

  async run(
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) {
    await interaction.deferReply({ ephemeral: false });
    const value = interaction.options.getUser("user");

    if (value) {
      const embed = new EmbedBuilder()
        .setTitle(value.username + " " + value.discriminator)
        .setImage(
          `https://cdn.discordapp.com/avatars/${value.id}/${value.avatar}.jpeg?size=300`
        )
        .setColor(client.color)
        .setFooter({
          text: `© ${interaction.guild!.members.me!.displayName}`,
          iconURL: client.user!.displayAvatarURL(),
        });
      await interaction.editReply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setTitle(
          interaction.user.username + " " + interaction.user.discriminator
        )
        .setImage(
          `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.jpeg?size=300`
        )
        .setColor(client.color)
        .setFooter({
          text: `© ${interaction.guild!.members.me!.displayName}`,
          iconURL: client.user!.displayAvatarURL(),
        });
      await interaction.editReply({ embeds: [embed] });
    }
  }
}
