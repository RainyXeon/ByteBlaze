import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Message,
} from "discord.js";
import { Manager } from "../../../manager.js";

export default {
  name: "playlist-remove",
  description: "Remove a song from a playlist",
  category: "Playlist",
  usage: "<playlist_name> <song_postion>",
  aliases: ["pl-remove"],
  owner: false,
  premium: false,
  lavalink: false,
  isManager: false,

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) => {
    const value = args[0] ? args[0] : null;
    const pos = args[1];
    if (value == null)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "invalid")}`
            )
            .setColor(client.color),
        ],
      });

    if (pos && isNaN(+pos))
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "number_invalid")}`
            )
            .setColor(client.color),
        ],
      });

    const Plist = value!.replace(/_/g, " ");
    const fullList = await client.db.playlist.all();

    const filter_level_1 = fullList.filter(function (data) {
      return data.value.owner == message.author.id && data.value.name == Plist;
    });

    const playlist = await client.db.playlist.get(`${filter_level_1[0].id}`);
    if (!playlist)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "remove_notfound")}`
            )
            .setColor(client.color),
        ],
      });
    if (playlist.owner !== message.author.id)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "remove_owner")}`
            )
            .setColor(client.color),
        ],
      });

    const position = pos;
    const song = playlist.tracks![Number(position) - 1];
    if (!song)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "remove_song_notfound")}`
            )
            .setColor(client.color),
        ],
      });
    await client.db.playlist.pull(
      `${filter_level_1[0].id}.tracks`,
      playlist.tracks![Number(position) - 1]
    );
    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "playlist", "remove_removed", {
          name: Plist,
          position: pos,
        })}`
      )
      .setColor(client.color);
    message.reply({ embeds: [embed] });
  },
};
