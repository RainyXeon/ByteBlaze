import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Message,
} from "discord.js";
import id from "voucher-code-generator";
import { Manager } from "../../../manager.js";

export default {
  name: "playlist-create",
  description: "Create a new playlist",
  category: "Playlist",
  usage: "<playlist_name> <playlist_description>",
  aliases: ["pl-create"],

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string,
  ) => {
    const value = args[0];
    const des = args[1];

    if (value.length > 16)
      return message.channel.send(
        `${client.i18n.get(language, "playlist", "create_toolong")}`,
      );
    if (des && des.length > 1000)
      return message.channel.send(
        `${client.i18n.get(language, "playlist", "des_toolong")}`,
      );

    const PlaylistName = value.replace(/_/g, " ");
    const msg = await message.channel.send(
      `${client.i18n.get(language, "playlist", "create_loading")}`,
    );

    const fullList = await client.db.get("playlist");

    const Limit = Object.keys(fullList)
      .filter(function (key) {
        return fullList[key].owner == message.author.id;
        // to cast back from an array of keys to the object, with just the passing ones
      })
      .reduce(function (obj: any, key) {
        obj[key] = fullList[key];
        return obj;
      }, {});

    const Exist = Object.keys(fullList)
      .filter(function (key) {
        return (
          fullList[key].owner == message.author.id &&
          fullList[key].name == PlaylistName
        );
        // to cast back from an array of keys to the object, with just the passing ones
      })
      .reduce(function (obj: any, key) {
        obj[key] = fullList[key];
        return obj;
      }, {});

    if (Object.keys(Exist).length !== 0) {
      msg.edit(`${client.i18n.get(language, "playlist", "create_name_exist")}`);
      return;
    }
    if (Object.keys(Limit).length >= client.config.bot.LIMIT_PLAYLIST) {
      msg.edit(
        `${client.i18n.get(language, "playlist", "create_limit_playlist", {
          limit: client.config.bot.LIMIT_PLAYLIST,
        })}`,
      );
      return;
    }

    const idgen = id.generate({ length: 8, prefix: "playlist-" });

    await client.db.set(`playlist.pid_${idgen}`, {
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
        })}`,
      )
      .setColor(client.color);
    msg.edit({ content: " ", embeds: [embed] });
  },
};
