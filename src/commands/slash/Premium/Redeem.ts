import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";
import moment from "moment";
import { Manager } from "../../../manager.js";

export default {
  name: ["redeem"],
  description: "Redeem your premium!",
  category: "Premium",
  options: [
    {
      name: "code",
      description: "The code you want to redeem",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ],
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string,
  ) => {
    await interaction.deferReply({ ephemeral: false });

    const input = (
      interaction.options as CommandInteractionOptionResolver
    ).getString("code");

    let member = await client.db.get(`premium.user_${interaction.user.id}`);

    if (member && member.isPremium) {
      const embed = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(
          `${client.i18n.get(language, "premium", "redeem_already")}`,
        );
      return interaction.editReply({ embeds: [embed] });
    }

    const premium = await client.db.get(`code.pmc_${input!.toUpperCase()}`);

    if (input == "pmc_thedreamvastghost")
      return interaction.editReply(
        "WU9VIENBTidUIERPIFRISVMgRk9SIEZSRUUgUFJFTUlVTQotIFJhaW55WGVvbiAt",
      );

    if (premium) {
      const expires = moment(premium.expiresAt).format(
        "do/MMMM/YYYY (HH:mm:ss)",
      );
      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${client.i18n.get(language, "premium", "redeem_title")}`,
          iconURL: client.user!.displayAvatarURL(),
        })
        .setDescription(
          `${client.i18n.get(language, "premium", "redeem_desc", {
            expires: expires,
            plan: premium.plan,
          })}`,
        )
        .setColor(client.color)
        .setTimestamp();

      const data = {
        id: interaction.user.id,
        isPremium: true,
        redeemedBy: interaction.user,
        redeemedAt: Date.now(),
        expiresAt: premium.expiresAt,
        plan: premium.plan,
      };

      await client.db.set(`premium.user_${interaction.user.id}`, data);
      await interaction.editReply({ embeds: [embed] });
      await client.premiums.set(interaction.user.id, data);
      return client.db.delete(`code.pmc_${input!.toUpperCase()}`);
    } else {
      const embed = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(
          `${client.i18n.get(language, "premium", "redeem_invalid")}`,
        );
      return interaction.editReply({ embeds: [embed] });
    }
  },
};
