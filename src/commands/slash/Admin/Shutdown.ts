import { CommandInteraction, EmbedBuilder } from "discord.js";
import { Manager } from "../../../manager.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";

export default class implements SlashCommand {
  name = ["sudo", "shutdown"];
  description = "Shuts down the client!";
  category = "Admin";
  accessableby = Accessableby.Owner;
  lavalink = false;
  options = [];
  async run(
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) {
    await interaction.deferReply({ ephemeral: false });

    const restart = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "utilities", "restart_msg")}`
      )
      .setColor(client.color)
      .setFooter({
        text: `© ${interaction.guild!.members.me!.displayName}`,
        iconURL: client.user!.displayAvatarURL(),
      });

    await interaction.editReply({ embeds: [restart] });

    process.exit();
  }
}
