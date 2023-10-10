import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
} from "discord.js";
import { Manager } from "../../../manager.js";

// Main code
export default {
  name: ["volume"],
  description: "Adjusts the volume of the bot.",
  category: "Music",
  owner: false,
  premium: false,
  lavalink: true,
  isManager: false,
  options: [
    {
      name: "amount",
      description: "The amount of volume to set the bot to.",
      type: ApplicationCommandOptionType.Number,
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
    ).getNumber("amount");
    const msg = await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "volume_loading")}`
          )
          .setColor(client.color),
      ],
    });

    const player = client.manager.players.get(interaction.guild!.id);
    if (!player)
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_player")}`
            )
            .setColor(client.color),
        ],
      });
    const { channel } = (interaction.member as GuildMember)!.voice;
    if (
      !channel ||
      (interaction.member as GuildMember)!.voice.channel !==
        interaction.guild!.members.me!.voice.channel
    )
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_voice")}`
            )
            .setColor(client.color),
        ],
      });

    if (!value)
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "volume_usage", {
                volume: String(player.volume),
              })}`
            )
            .setColor(client.color),
        ],
      });
    if (Number(value) <= 0 || Number(value) > 100)
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "volume_invalid")}`
            )
            .setColor(client.color),
        ],
      });

    await player.setVolume(Number(value));

    const changevol = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "music", "volume_msg", {
          volume: String(value),
        })}`
      )
      .setColor(client.color);

    msg.edit({ content: " ", embeds: [changevol] });
  },
};
