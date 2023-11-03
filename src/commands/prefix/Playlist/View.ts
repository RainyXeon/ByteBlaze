import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Message,
} from "discord.js";
import { Manager } from "../../../manager.js";

export default {
  name: "playlist-view",
  description: "Public or private a playlist",
  category: "Playlist",
  usage: "<playlist_name>",
  aliases: ["pl-view"],
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
    const PName = value!.replace(/_/g, " ");

    const fullList = await client.db.get("playlist");

    const pid = Object.keys(fullList).filter(function (key) {
      return (
        fullList[key].owner == message.author.id && fullList[key].name == PName
      );
    });

    const playlist = fullList[pid[0]];

    if (!playlist)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "public_notfound")}`
            )
            .setColor(client.color),
        ],
      });
    if (playlist.owner !== message.author.id)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "public_owner")}`
            )
            .setColor(client.color),
        ],
      });

    const Public = Object.keys(fullList)
      .filter(function (key) {
        return fullList[key].private == false && fullList[key].name == PName;
        // to cast back from an array of keys to the object, with just the passing ones
      })
      .forEach(async (key) => {
        return fullList[key];
      });
    if (Public !== null || undefined || false)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "public_already")}`
            )
            .setColor(client.color),
        ],
      });

    const msg = await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "playlist", "public_loading")}`
          )
          .setColor(client.color),
      ],
    });

    client.db.set(
      `playlist.pid_${playlist.id}.private`,
      playlist.private == true ? false : true
    );

    const playlist_now = await client.db.get(
      `playlist.pid_${playlist.id}.private`
    );

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "playlist", "public_success", {
          view: playlist_now == true ? "Private" : "Public",
        })}`
      )
      .setColor(client.color);
    msg.edit({ content: " ", embeds: [embed] });
  },
};
