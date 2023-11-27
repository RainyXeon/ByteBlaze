import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  PermissionsBitField,
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";
import { Manager } from "../../../manager.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";

export default class implements SlashCommand {
  name = ["settings", "language"];
  description = "Change the language for the bot";
  category = "Utils";
  accessableby = Accessableby.Manager;
  lavalink = false;
  options = [
    {
      name: "input",
      description: "The new language",
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
    ).getString("input");

    const languages = client.i18n.getLocales();

    if (!languages.includes(input as string))
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "utilities", "provide_lang", {
                languages: languages.join(", "),
              })}`
            )
            .setColor(client.color),
        ],
      });

    const newLang = await client.db.language.get(`${interaction.guild!.id}`);

    if (!newLang) {
      await client.db.language.set(`${interaction.guild!.id}`, input);
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "utilities", "lang_set", {
            language: String(input),
          })}`
        )
        .setColor(client.color);

      return interaction.editReply({ content: " ", embeds: [embed] });
    } else if (newLang) {
      await client.db.language.set(`${interaction.guild!.id}`, input);

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "utilities", "lang_change", {
            language: String(input),
          })}`
        )
        .setColor(client.color);

      return interaction.editReply({ content: " ", embeds: [embed] });
    }
  }
}
