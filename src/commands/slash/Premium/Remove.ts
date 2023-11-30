import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";
import { Manager } from "../../../manager.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";

export default class implements SlashCommand {
  name = ["premium", "remove"];
  description = "Remove premium from members!";
  category = "Premium";
  lavalink = false;
  accessableby = Accessableby.Owner;
  options = [
    {
      name: "target",
      description: "Mention a user want to remove!",
      required: false,
      type: ApplicationCommandOptionType.User,
    },
    {
      name: "id",
      description: "The user id you want to remove!",
      required: false,
      type: ApplicationCommandOptionType.String,
    },
  ];

  async run(
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) {
    let db;

    await interaction.deferReply({ ephemeral: false });

    const mentions = interaction.options.getUser("target");

    const id = (
      interaction.options as CommandInteractionOptionResolver
    ).getString("id");

    if (!id && !mentions)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "premium", "remove_no_params")}`
            )
            .setColor(client.color),
        ],
      });
    if (id && mentions)
      return interaction.editReply({
        content: `${client.i18n.get(
          language,
          "premium",
          "remove_only_params"
        )}`,
      });
    if (id && !mentions) db = await client.db.premium.get(`${id}`);
    if (mentions && !id) db = await client.db.premium.get(`${mentions.id}`);

    if (!db)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "premium", "remove_404", {
                userid: String(id),
              })}`
            )
            .setColor(client.color),
        ],
      });

    if (db.isPremium) {
      const data = {
        id: id || mentions!.id,
        isPremium: false,
        redeemedAt: null,
        expiresAt: null,
        plan: null,
      };

      await client.db.premium.set(`${data.id}`, data);

      await client.premiums.set(id || mentions!.id, data);

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "premium", "remove_desc", {
            user: String(mentions),
          })}`
        )
        .setColor(client.color);

      interaction.editReply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "premium", "remove_already", {
            user: String(mentions),
          })}`
        )
        .setColor(client.color);

      interaction.editReply({ embeds: [embed] });
    }
  }
}
