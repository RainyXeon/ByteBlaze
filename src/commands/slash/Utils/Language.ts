import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  PermissionsBitField,
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";
import { Manager } from "../../../manager.js";

export default {
  name: ["settings", "language"],
  description: "Change the language for the bot",
  category: "Utils",
  options: [
    {
      name: "input",
      description: "The new language",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ],
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) => {
    await interaction.deferReply({ ephemeral: false });
    const input = (
      interaction.options as CommandInteractionOptionResolver
    ).getString("input");

    if (
      !(interaction.member!.permissions as Readonly<PermissionsBitField>).has(
        PermissionsBitField.Flags.ManageGuild
      )
    )
      return interaction.editReply(
        `${client.i18n.get(language, "utilities", "lang_perm")}`
      );
    const languages = client.i18n.getLocales();

    if (!languages.includes(input as string))
      return interaction.editReply(
        `${client.i18n.get(language, "utilities", "provide_lang", {
          languages: languages.join(", "),
        })}`
      );

    const newLang = await client.db.get(
      `language.guild_${interaction.guild!.id}`
    );

    if (!newLang) {
      await client.db.set(`language.guild_${interaction.guild!.id}`, input);
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "utilities", "lang_set", {
            language: String(input),
          })}`
        )
        .setColor(client.color);

      return interaction.editReply({ content: " ", embeds: [embed] });
    } else if (newLang) {
      await client.db.set(`language.guild_${interaction.guild!.id}`, input);

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "utilities", "lang_change", {
            language: String(input),
          })}`
        )
        .setColor(client.color);

      return interaction.editReply({ content: " ", embeds: [embed] });
    }
  },
};
