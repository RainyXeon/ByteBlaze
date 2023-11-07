import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Message,
} from "discord.js";
import id from "voucher-code-generator";
import { Manager } from "../../../manager.js";
import { Playlist } from "../../../database/schema/Playlist.js";

export default {
  name: "playlist-create",
  description: "Create a new playlist",
  category: "Playlist",
  usage: "<playlist_name> <playlist_description>",
  aliases: ["pl-create"],
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
    const value = args[0];
    const des = args[1];

    if (value == null || !value)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "invalid")}`
            )
            .setColor(client.color),
        ],
      });

    if (value.length > 16)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "create_toolong")}`
            )
            .setColor(client.color),
        ],
      });
    if (des && des.length > 1000)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "des_toolong")}`
            )
            .setColor(client.color),
        ],
      });

    const PlaylistName = value.replace(/_/g, " ");
    const msg = await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "playlist", "create_loading")}`
          )
          .setColor(client.color),
      ],
    });

    const fullList = await client.db.playlist.all();

    const Limit = fullList.filter((data) => {
      return data.value.owner == message.author.id;
    });

    const Exist = fullList.filter(function (data) {
      return (
        data.value.owner == message.author.id && data.value.name == PlaylistName
      );
    });

    if (Exist.length !== 0) {
      msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "create_name_exist")}`
            )
            .setColor(client.color),
        ],
      });
      return;
    }
    if (Limit.length >= client.config.bot.LIMIT_PLAYLIST) {
      msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "create_name_exist")}`
            )
            .setColor(client.color),
        ],
      });
      return;
    }

    const idgen = id.generate({ length: 8, prefix: "playlist-" });

    await client.db.playlist.set(`${idgen}`, {
      id: idgen[0],
      name: PlaylistName,
      owner: message.author.id,
      tracks: [],
      private: true,
      created: Date.now(),
      description: des ? des : null,
    });

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "playlist", "create_created", {
          playlist: PlaylistName,
        })}`
      )
      .setColor(client.color);
    msg.edit({ content: " ", embeds: [embed] });
  },
};
