import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Message,
} from "discord.js";
import { Manager } from "../../../manager.js";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";

export default class implements PrefixCommand {
  name = "playlist-view";
  description = "Public or private a playlist";
  category = "Playlist";
  usage = "<playlist_name>";
  aliases = ["pl-view"];
  lavalink = false;
  accessableby = Accessableby.Member;

  async run(
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) {
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

    const fullList = await client.db.playlist.all();

    const filter_level_1 = fullList.filter(function (data) {
      return data.value.owner == message.author.id && data.value.name == PName;
    });

    const playlist = await client.db.playlist.get(`${filter_level_1[0].id}`);

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

    const Public = fullList.filter(function (data) {
      return data.value.private == false && data.value.name == PName;
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

    client.db.playlist.set(
      `${playlist.id}.private`,
      playlist.private == true ? false : true
    );

    const playlist_now = await client.db.playlist.get(`${playlist.id}.private`);

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "playlist", "public_success", {
          view: playlist_now?.private == true ? "Private" : "Public",
        })}`
      )
      .setColor(client.color);
    msg.edit({ content: " ", embeds: [embed] });
  }
}
