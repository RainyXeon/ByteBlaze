import {
  EmbedBuilder,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
  ApplicationCommandOptionType,
} from "discord.js";
import formatDuration from "../../../structures/FormatDuration.js";
import { Manager } from "../../../manager.js";
const rewindNum = 10;

// Main code
export default {
  name: ["rewind"],
  description: "Rewind timestamp in the song!",
  category: "Music",
  options: [
    {
      name: "seconds",
      description: "Rewind timestamp in the song!",
      type: ApplicationCommandOptionType.Number,
      required: false,
    },
  ],
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) => {
    await interaction.deferReply({ ephemeral: false });
    const msg = await interaction.editReply(
      `${client.i18n.get(language, "music", "rewind_loading")}`
    );
    const value = (
      interaction.options as CommandInteractionOptionResolver
    ).getNumber("seconds");

    const player = client.manager.players.get(interaction.guild!.id);
    if (!player)
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_player")}`);
    const { channel } = (interaction.member as GuildMember).voice;
    if (
      !channel ||
      (interaction.member as GuildMember).voice.channel !==
        interaction.guild!.members.me!.voice.channel
    )
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_voice")}`);

    const song_position = player.shoukaku.position;
    const CurrentDuration = formatDuration(song_position);

    if (value && !isNaN(value)) {
      if (song_position - value * 1000 > 0) {
        await player["send"]({
          op: "seek",
          guildId: interaction.guild!.id,
          position: song_position - value * 1000,
        });

        const rewind1 = new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "rewind_msg", {
              duration: CurrentDuration,
            })}`
          )
          .setColor(client.color);

        msg.edit({ content: " ", embeds: [rewind1] });
      } else {
        return msg.edit(
          `${client.i18n.get(language, "music", "rewind_beyond")}`
        );
      }
    } else if (value && isNaN(value)) {
      return msg.edit(
        `${client.i18n.get(language, "music", "rewind_invalid", {
          prefix: "/",
        })}`
      );
    }

    if (!value) {
      if (song_position - rewindNum * 1000 > 0) {
        await player["send"]({
          op: "seek",
          guildId: interaction.guild!.id,
          position: song_position - rewindNum * 1000,
        });

        const rewind2 = new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "rewind_msg", {
              duration: CurrentDuration,
            })}`
          )
          .setColor(client.color);

        msg.edit({ content: " ", embeds: [rewind2] });
      } else {
        return msg.edit(
          `${client.i18n.get(language, "music", "rewind_beyond")}`
        );
      }
    }
  },
};
