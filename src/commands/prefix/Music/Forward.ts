import { EmbedBuilder, Message } from "discord.js";
import formatDuration from "../../../structures/FormatDuration.js";
import { Manager } from "../../../manager.js";
const fastForwardNum = 10;

// Main code
module.exports = {
  name: "forward",
  description: "Forward timestamp in the song!",
  category: "Music",
  usage: "<seconds>",
  aliases: [],

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string,
  ) => {
    const value = args[0];

    const msg = await message.channel.send(
      `${client.i18n.get(language, "music", "forward_loading")}`,
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

    const song = player.queue.current;
    const song_position = player.shoukaku.position;
    const CurrentDuration = formatDuration(song_position);

    if (value && !isNaN(+value)) {
      if (song_position + Number(value) * 1000 < song!.length!) {
        player["send"]({
          op: "seek",
          guildId: message.guild!.id,
          position: song_position + Number(value) * 1000,
        });

        const forward1 = new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "forward_msg", {
              duration: CurrentDuration,
            })}`,
          )
          .setColor(client.color);

        msg.edit({ content: " ", embeds: [forward1] });
      } else {
        return msg.edit(
          `${client.i18n.get(language, "music", "forward_beyond")}`,
        );
      }
    } else if (value && isNaN(+value)) {
      return msg.edit(
        `${client.i18n.get(language, "music", "forward_invalid", {
          prefix: prefix,
        })}`,
      );
    }

    if (!value) {
      if (song_position + fastForwardNum * 1000 < song!.length!) {
        player["send"]({
          op: "seek",
          guildId: message.guild!.id,
          position: song_position + fastForwardNum * 1000,
        });

        const forward2 = new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "forward_msg", {
              duration: CurrentDuration,
            })}`,
          )
          .setColor(client.color);

        msg.edit({ content: " ", embeds: [forward2] });
      } else {
        return msg.edit(
          `${client.i18n.get(language, "music", "forward_beyond")}`,
        );
      }
    }
  },
};
