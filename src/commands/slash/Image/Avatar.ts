import { CommandInteraction } from "discord.js";
import { Manager } from "../../../manager.js";
import { EmbedBuilder, ApplicationCommandOptionType } from "discord.js";

export default {
  name: ["avatar"],
  description: "Show your or someone else's profile picture",
  category: "Image",
  owner: false,
  premium: false,
  lavalink: false,
  isManager: false,
  options: [
    {
      name: "user",
      description: "Type your user here",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) => {
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
  },
};
