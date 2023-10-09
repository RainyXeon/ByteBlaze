import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  PermissionsBitField,
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";
import { Manager } from "../../../manager.js";

export default {
  name: ["settings", "control"],
  description: "Enable or disable the player control",
  category: "Utils",
  owner: false,
  premium: false,
  lavalink: false,
  isManager: true,
  options: [
    {
      name: "type",
      description: "Choose enable or disable",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        {
          name: "Enable",
          value: "enable",
        },
        {
          name: "Disable",
          value: "disable",
        },
      ],
    },
  ],
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) => {
    await interaction.deferReply({ ephemeral: false });
    if (
      (interaction.options as CommandInteractionOptionResolver).getString(
        "type"
      ) === "enable"
    ) {
      await client.db.set(`control.guild_${interaction.guild!.id}`, "enable");

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "utilities", "control_set", {
            toggle: `${client.i18n.get(language, "music", "enabled")}`,
          })}`
        )
        .setColor(client.color);

      return interaction.editReply({ embeds: [embed] });
    } else if (
      (interaction.options as CommandInteractionOptionResolver).getString(
        "type"
      ) === "disable"
    ) {
      await client.db.set(`control.guild_${interaction.guild!.id}`, "enable");
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "utilities", "control_set", {
            toggle: `${client.i18n.get(language, "music", "disabled")}`,
          })}`
        )
        .setColor(client.color);

      return interaction.editReply({ embeds: [embed] });
    }
  },
};
