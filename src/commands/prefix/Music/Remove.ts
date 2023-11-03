import { Message } from "discord.js";
import { EmbedBuilder } from "discord.js";
import { convertTime } from "../../../structures/ConvertTime.js";
import { Manager } from "../../../manager.js";

// Main code
export default {
  name: "remove",
  description: "Remove song from queue.",
  category: "Music",
  usage: "<position>",
  aliases: ["rm"],
  owner: false,
  premium: false,
  lavalink: true,
  isManager: false,

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) => {
    const msg = await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "pause_loading")}`
          )
          .setColor(client.color),
      ],
    });

    const player = client.manager.players.get(message.guild!.id);
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
    const { channel } = message.member!.voice;
    if (
      !channel ||
      message.member!.voice.channel !== message.guild!.members.me!.voice.channel
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

    const tracks = args[0];
    if (tracks && isNaN(+tracks))
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "number_invalid")}`
            )
            .setColor(client.color),
        ],
      });
    if (Number(tracks) == 0)
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "removetrack_already")}`
            )
            .setColor(client.color),
        ],
      });
    if (Number(tracks) > player.queue.length)
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "removetrack_notfound")}`
            )
            .setColor(client.color),
        ],
      });

    const song = player.queue[Number(tracks) - 1];

    player.queue.splice(Number(tracks) - 1, 1);

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "music", "removetrack_desc", {
          name: song.title,
          url: song.uri,
          duration: convertTime(player.shoukaku.position),
          request: String(song.requester),
        })}`
      )
      .setColor(client.color);

    return msg.edit({ embeds: [embed] });
  },
};
