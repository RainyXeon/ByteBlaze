import { CommandInteraction, EmbedBuilder } from "discord.js";
import { Manager } from "../../../manager.js";

export default {
  name: ["sudo", "restart"],
  description: "Shuts down the client!",
  category: "Admin",
  owner: true,
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string,
  ) => {
    await interaction.deferReply({ ephemeral: false });

    if (interaction.user.id != client.owner)
      return interaction.editReply({
        content: `${client.i18n.get(language, "interaction", "owner_only")}`,
      });

    const restart = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "utilities", "restart_msg")}`,
      )
      .setColor(client.color)
      .setFooter({
        text: `© ${interaction.guild!.members.me!.displayName}`,
        iconURL: client.user!.displayAvatarURL(),
      });

    await interaction.editReply({ embeds: [restart] });

    process.exit();
  },
};
