import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Message,
} from "discord.js";
import { Manager } from "../../../manager.js";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";

let count = 0;
let answer: string[] = [];

export default class implements PrefixCommand {
  name = "playlist-editor";
  description = "Edit playlist info for public";
  category = "Playlist";
  usage = "<playlist_id>";
  aliases = ["pl-editor"];
  lavalink = false;
  accessableby = Accessableby.Member;

  private questionString(client: Manager, language: string) {
    return [
      {
        question: `${client.i18n.get(
          language,
          "playlist",
          "edit_playlist_name_label"
        )}`,
      },
      {
        question: `${client.i18n.get(
          language,
          "playlist",
          "edit_playlist_des_label"
        )}`,
      },
      {
        question: `${client.i18n.get(
          language,
          "playlist",
          "edit_playlist_private_label"
        )}`,
      },
    ];
  }

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
              `${client.i18n.get(language, "playlist", "edit_arg")}`
            )
            .setColor(client.color),
        ],
      });

    const playlist = await client.db.playlist.get(value);

    if (!playlist)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "edit_notfound")}`
            )
            .setColor(client.color),
        ],
      });
    if (playlist.owner !== message.author.id)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "edit_playlist_owner")}`
            )
            .setColor(client.color),
        ],
      });

    const questions = this.questionString(client, language);

    for (let i = 0; i < questions.length; i++) {
      const send = await message.reply(questions[i].question);
      const res = await send.channel.awaitMessages({
        filter: (m) => m.author.id === message.author.id,
        time: 5 * 6000,
        max: 1,
      });
      const msg = await res.first()!.content;
      if (msg !== undefined || null) count++;
      answer.push(msg);
      if (count == questions.length) {
        await client.db.playlist.set(`${value}.name`, answer[0]);
        await client.db.playlist.set(`${value}.description`, answer[1]);
        await client.db.playlist.set(
          `${value}.private`,
          this.parseBoolean(answer[3])
        );

        const embed = new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "playlist", "edit_success")}`
          )
          .setColor(client.color);
        message.reply({ embeds: [embed] });

        count = 0;
        answer.length = 0;
      }
    }
  }

  private parseBoolean(value: string) {
    if (typeof value === "string") {
      value = value.trim().toLowerCase();
    }
    switch (value) {
      case "enable":
        return true;
      case "disable":
        return false;
      default:
        return false;
    }
  }
}
