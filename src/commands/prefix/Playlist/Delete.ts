import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Message,
} from "discord.js";
import { Manager } from "../../../manager.js";

export default {
  name: "playlist-delete",
  description: "Delete a playlist",
  category: "Playlist",
  usage: "<playlist_name>",
  aliases: ["pl-delete"],
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
              `${client.i18n.get(language, "playlist", "delete_notfound")}`
            )
            .setColor(client.color),
        ],
      });
    if (playlist.owner !== message.author.id)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "delete_owner")}`
            )
            .setColor(client.color),
        ],
      });

    await client.db.playlist.delete(`playlist.${filter_level_1[0].id}`);
    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "playlist", "delete_deleted", {
          name: Plist,
        })}`
      )
      .setColor(client.color);
    message.reply({ embeds: [embed] });
  },
};
