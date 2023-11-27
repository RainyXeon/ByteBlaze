import { CommandInteraction, EmbedBuilder } from "discord.js";
import moment from "moment";
import { Manager } from "../../../manager.js";
import {
  Accessableby,
  CommandOptionInterface,
  SlashCommand,
} from "../../../@types/Command.js";

export default class implements SlashCommand {
  name = ["profile"];
  description = "View your premium profile!";
  category = "Premium";
  lavalink = false;
  options = [];
  accessableby = Accessableby.Premium;

  async run(
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) {
    await interaction.deferReply({ ephemeral: false });

    const PremiumPlan = await client.db.premium.get(`${interaction.user.id}`);
    const expires = moment(PremiumPlan!.expiresAt).format(
      "do/MMMM/YYYY (HH:mm:ss)"
    );

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${client.i18n.get(language, "premium", "profile_author")}`,
        iconURL: client.user!.displayAvatarURL(),
      })
      .setDescription(
        `${client.i18n.get(language, "premium", "profile_desc", {
          user: interaction.user.tag,
          plan: PremiumPlan!.plan,
          expires: expires,
        })}`
      )
      .setColor(client.color)
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  }
}
