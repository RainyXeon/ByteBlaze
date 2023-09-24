import { EmbedBuilder, Message, PermissionsBitField } from "discord.js";
import formatDuration from "../../../structures/FormatDuration.js";
import { Manager } from "../../../manager.js";
const rewindNum = 10;

// Main code
export default {
  name: "rewind",
  description: "Rewind timestamp in the song!",
  category: "Music",
  usage: "<seconds>",
  aliases: [],
  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) => {
    const msg = await message.channel.send(
      `${client.i18n.get(language, "music", "rewind_loading")}`
    );
    const value = args[0];

    if (value && isNaN(+value))
      return msg.edit(
        `${client.i18n.get(language, "music", "number_invalid")}`
      );

    const player = client.manager.players.get(message.guild!.id);
    if (!player)
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_player")}`);
    const { channel } = message.member!.voice;
    if (
      !channel ||
      message.member!.voice.channel !== message.guild!.members.me!.voice.channel
    )
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_voice")}`);

    const song_position = player.shoukaku.position;
    const CurrentDuration = formatDuration(song_position);

    if (value && !isNaN(+value)) {
      if (song_position - Number(value) * 1000 > 0) {
        await player["send"]({
          op: "seek",
          guildId: message.guild!.id,
          position: song_position - Number(value) * 1000,
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
    } else if (value && isNaN(+value)) {
      return msg.edit(
        `${client.i18n.get(language, "music", "rewind_invalid", {
          prefix: prefix,
        })}`
      );
    }

    if (!value) {
      if (song_position - rewindNum * 1000 > 0) {
        await player["send"]({
          op: "seek",
          guildId: message.guild!.id,
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
