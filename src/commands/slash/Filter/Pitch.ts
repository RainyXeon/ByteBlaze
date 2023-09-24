import {
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
} from "discord.js";
import { Manager } from "../../../manager.js";
import { EmbedBuilder, ApplicationCommandOptionType } from "discord.js";
import delay from "delay";

export default {
  name: ["filter", "pitch"],
  description: "Sets the pitch of the song.",
  category: "Filter",
  options: [
    {
      name: "amount",
      description: "The amount of pitch to change the song by.",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) => {
    await interaction.deferReply({ ephemeral: false });

    const value = (
      interaction.options as CommandInteractionOptionResolver
    ).getInteger("amount");

    const player = client.manager.players.get(interaction.guild!.id);
    if (!player)
      return interaction.editReply(
        `${client.i18n.get(language, "noplayer", "no_player")}`
      );
    const { channel } = (interaction.member as GuildMember).voice;
    if (
      !channel ||
      (interaction.member as GuildMember).voice.channel !==
        interaction.guild?.members.me!.voice.channel
    )
      return interaction.editReply(
        `${client.i18n.get(language, "noplayer", "no_voice")}`
      );

    if (value! < 0)
      return interaction.editReply(
        `${client.i18n.get(language, "filters", "filter_greater")}`
      );
    if (value! > 10)
      return interaction.editReply(
        `${client.i18n.get(language, "filters", "filter_less")}`
      );

    const data = {
      op: "filters",
      guildId: interaction.guild.id,
      timescale: { pitch: value },
    };

    await player["send"](data);

    const msg = await interaction.editReply(
      `${client.i18n.get(language, "filters", "pitch_loading", {
        amount: String(value),
      })}`
    );
    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "filters", "pitch_on", {
          amount: String(value),
        })}`
      )
      .setColor(client.color);
    await delay(2000);
    msg.edit({ content: " ", embeds: [embed] });
  },
};
