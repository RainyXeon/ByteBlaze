import { EmbedBuilder, Message } from "discord.js";
import humanizeDuration from "humanize-duration";
import { Playlist } from "../../../database/schema/Playlist.js";
import { Manager } from "../../../manager.js";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";

let info: Playlist | null;

export default class implements PrefixCommand {
  name = "playlist-info";
  description = "Check the playlist infomation";
  category = "Playlist";
  usage = "<playlist_name_or_id>";
  aliases = ["pl-info"];
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

    if (value) {
      const Plist = value.replace(/_/g, " ");

      const fullList = await client.db.playlist.all();

      const filter_level_1 = fullList.filter(function (data) {
        return (
          data.value.owner == message.author.id && data.value.name == Plist
        );
      });

      info = filter_level_1[0].value;
    }

    if (!info)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "invalid")}`
            )
            .setColor(client.color),
        ],
      });
    if (info.private && info.owner !== message.author.id) {
      message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "import_private")}`
            )
            .setColor(client.color),
        ],
      });
      return;
    }
    const created = humanizeDuration(Date.now() - Number(info.created), {
      largest: 1,
    });

    const name = await client.users.fetch(info.owner);

    const embed = new EmbedBuilder()
      .setTitle(
        `${client.i18n.get(language, "playlist", "info_title", {
          name: info.name,
        })}`
      )
      .addFields([
        {
          name: `${client.i18n.get(language, "playlist", "info_name")}`,
          value: `${info.name}`,
          inline: true,
        },
        {
          name: `${client.i18n.get(language, "playlist", "info_id")}`,
          value: `${info.id}`,
          inline: true,
        },
        {
          name: `${client.i18n.get(language, "playlist", "info_total")}`,
          value: `${info.tracks!.length}`,
          inline: true,
        },
        {
          name: `${client.i18n.get(language, "playlist", "info_created")}`,
          value: `${created}`,
          inline: true,
        },
        {
          name: `${client.i18n.get(language, "playlist", "info_private")}`,
          value: `${
            info.private
              ? client.i18n.get(language, "playlist", "enabled")
              : client.i18n.get(language, "playlist", "disabled")
          }`,
          inline: true,
        },
        {
          name: `${client.i18n.get(language, "playlist", "info_owner")}`,
          value: `${name.username}`,
          inline: true,
        },
        {
          name: `${client.i18n.get(language, "playlist", "info_des")}`,
          value: `${
            info.description === null
              ? client.i18n.get(language, "playlist", "no_des")
              : info.description
          }`,
        },
      ])
      .setColor(client.color);
    message.reply({ embeds: [embed] });
  }
}
