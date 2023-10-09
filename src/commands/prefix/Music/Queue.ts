import { EmbedBuilder, Message, PermissionsBitField } from "discord.js";
import formatDuration from "../../../structures/FormatDuration.js";
import { convertTime } from "../../../structures/ConvertTime.js";
import { NormalPage } from "../../../structures/PageQueue.js";
import { Manager } from "../../../manager.js";

// Main code
export default {
  name: "queue",
  description: "Show the queue of songs.",
  category: "Music",
  usage: "",
  aliases: [],
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
    const value = args[0];

    if (value && isNaN(+value))
      return message.channel.send(
        `${client.i18n.get(language, "music", "number_invalid")}`
      );

    const player = client.manager.players.get(message.guild!.id);
    if (!player)
      return message.channel.send(
        `${client.i18n.get(language, "noplayer", "no_player")}`
      );
    const { channel } = message.member!.voice;
    if (
      !channel ||
      message.member!.voice.channel !== message.guild!.members.me!.voice.channel
    )
      return message.channel.send(
        `${client.i18n.get(language, "noplayer", "no_voice")}`
      );

    const song = player.queue.current;
    function fixedduration() {
      const current = player!.queue.current!.length ?? 0;
      return player!.queue.reduce(
        (acc, cur) => acc + (cur.length || 0),
        current
      );
    }
    const qduration = `${formatDuration(fixedduration())}`;
    const thumbnail = `https://img.youtube.com/vi/${
      song!.identifier
    }/hqdefault.jpg`;

    let pagesNum = Math.ceil(player.queue.length / 10);
    if (pagesNum === 0) pagesNum = 1;

    const songStrings = [];
    for (let i = 0; i < player.queue.length; i++) {
      const song = player.queue[i];
      songStrings.push(
        `**${i + 1}.** [${song.title}](${song.uri}) \`[${formatDuration(
          song.length
        )}]\`
                    `
      );
    }

    const pages = [];
    for (let i = 0; i < pagesNum; i++) {
      const str = songStrings.slice(i * 10, i * 10 + 10).join("");

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${client.i18n.get(language, "music", "queue_author", {
            guild: message.guild!.name,
          })}`,
          iconURL: message.guild!.iconURL() as string,
        })
        .setThumbnail(thumbnail)
        .setColor(client.color)
        .setDescription(
          `${client.i18n.get(language, "music", "queue_description", {
            title: String(song!.title),
            url: String(song!.uri),
            request: String(song!.requester),
            duration: formatDuration(song!.length),
            rest: str == "" ? "  Nothing" : "\n" + str,
          })}`
        )
        .setFooter({
          text: `${client.i18n.get(language, "music", "queue_footer", {
            page: String(i + 1),
            pages: String(pagesNum),
            queue_lang: String(player.queue.length),
            duration: qduration,
          })}`,
        });

      pages.push(embed);
    }

    if (!value) {
      if (pages.length == pagesNum && player.queue.length > 10)
        NormalPage(
          client,
          message,
          pages,
          60000,
          player.queue.length,
          Number(qduration),
          language
        );
      else return message.channel.send({ embeds: [pages[0]] });
    } else {
      if (isNaN(+value))
        return message.channel.send(
          `${client.i18n.get(language, "music", "queue_notnumber")}`
        );
      if (Number(value) > pagesNum)
        return message.channel.send(
          `${client.i18n.get(language, "music", "queue_page_notfound", {
            page: String(pagesNum),
          })}`
        );
      const pageNum = Number(value) == 0 ? 1 : Number(value) - 1;
      return message.channel.send({ embeds: [pages[pageNum]] });
    }
  },
};
