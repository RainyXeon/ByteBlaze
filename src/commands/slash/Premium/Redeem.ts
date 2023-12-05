import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";
import moment from "moment";
import { Manager } from "../../../manager.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";

export default class implements SlashCommand {
  name = ["redeem"];
  description = "Redeem your premium!";
  category = "Premium";
  accessableby = Accessableby.Member;
  lavalink = false;
  options = [
    {
      name: "code",
      description: "The code you want to redeem",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ];

  async run(
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) {
    await interaction.deferReply({ ephemeral: false });

    const input = (
      interaction.options as CommandInteractionOptionResolver
    ).getString("code");

    let member = await client.db.premium.get(`${interaction.user.id}`);

    if (member && member.isPremium) {
      const embed = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(
          `${client.i18n.get(language, "premium", "redeem_already")}`
        );
      return interaction.editReply({ embeds: [embed] });
    }

    const premium = await client.db.code.get(`${input!.toUpperCase()}`);

    if (input == "pmc_thedreamvastghost")
      return interaction.editReply(
        "WU9VIENBTidUIERPIFRISVMgRk9SIEZSRUUgUFJFTUlVTQotIFJhaW55WGVvbiAt"
      );

    if (!premium) {
      const embed = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(
          `${client.i18n.get(language, "premium", "redeem_invalid")}`
        );
      return interaction.editReply({ embeds: [embed] });
    }

    if (premium.expiresAt < Date.now()) {
      const embed = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(
          `${client.i18n.get(language, "premium", "redeem_invalid")}`
        );
      return interaction.editReply({ embeds: [embed] });
    }

    const expires = moment(premium.expiresAt).format("dddd, MMMM Do YYYY");
    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${client.i18n.get(language, "premium", "redeem_title")}`,
        iconURL: client.user!.displayAvatarURL(),
      })
      .setDescription(
        `${client.i18n.get(language, "premium", "redeem_desc", {
          expires: expires,
          plan: premium.plan,
        })}`
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

    await client.db.premium.set(`${interaction.user.id}`, data);
    await interaction.editReply({ embeds: [embed] });
    await client.premiums.set(interaction.user.id, data);
    return client.db.code.delete(`${input!.toUpperCase()}`);
  }
}
