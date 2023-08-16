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

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string,
  ) => {
    const value = args[0] ? args[0] : null;
    const Plist = value!.replace(/_/g, " ");

    const fullList = await client.db.get("playlist");

    const filter_level_1 = Object.keys(fullList).filter(function (key) {
      return (
        fullList[key].owner == message.author.id && fullList[key].name == Plist
      );
    });

    const playlist = await client.db.get(`playlist.${filter_level_1[0]}`);

    if (!playlist)
      return message.channel.send(
        `${client.i18n.get(language, "playlist", "delete_notfound")}`,
      );
    if (playlist.owner !== message.author.id)
      return message.channel.send(
        `${client.i18n.get(language, "playlist", "delete_owner")}`,
      );

    await client.db.delete(`playlist.${filter_level_1[0]}`);
    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "playlist", "delete_deleted", {
          name: Plist,
        })}`,
      )
      .setColor(client.color);
    message.channel.send({ embeds: [embed] });
  },
};
