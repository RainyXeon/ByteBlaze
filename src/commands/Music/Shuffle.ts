import { EmbedBuilder } from "discord.js";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { KazagumoPlayer } from "../../lib/main.js";
import { FormatDuration } from "../../utilities/FormatDuration.js";
import { PageQueue } from "../../structures/PageQueue.js";

// Main code
export default class implements Command {
  public name = ["shuffle"];
  public description = "Shuffle song in queue!";
  public category = "Music";
  public accessableby = Accessableby.Member;
  public usage = "";
  public aliases = [];
  public lavalink = true;
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = true;
  public options = [];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const player = client.manager.players.get(
      handler.guild!.id
    ) as KazagumoPlayer;

    const newQueue = await player.queue.shuffle();

    const song = newQueue.current;

    function fixedduration() {
      const current = newQueue.current!.length ?? 0;
      return newQueue.reduce((acc, cur) => acc + (cur.length || 0), current);
    }
    const qduration = `${new FormatDuration().parse(fixedduration())}`;
    const thumbnail = `https://img.youtube.com/vi/${
      song!.identifier
    }/hqdefault.jpg`;

    let pagesNum = Math.ceil(newQueue.length / 10);
    if (pagesNum === 0) pagesNum = 1;

    const songStrings = [];
    for (let i = 0; i < newQueue.length; i++) {
      const song = newQueue[i];
      songStrings.push(
        `**${i + 1}.** [${song.title}](${
          song.uri
        }) \`[${new FormatDuration().parse(song.length)}]\`
                    `
      );
    }

    const pages = [];
    for (let i = 0; i < pagesNum; i++) {
      const str = songStrings.slice(i * 10, i * 10 + 10).join("");

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${client.i18n.get(handler.language, "music", "shuffle_msg")}`,
        })
        .setThumbnail(thumbnail)
        .setColor(client.color)
        .setDescription(
          `${client.i18n.get(handler.language, "music", "queue_description", {
            title: String(song!.title),
            url: String(song!.uri),
            request: String(song!.requester),
            duration: new FormatDuration().parse(song!.length),
            rest: str == "" ? "  Nothing" : "\n" + str,
          })}`
        )
        .setFooter({
          text: `${client.i18n.get(handler.language, "music", "queue_footer", {
            page: String(i + 1),
            pages: String(pagesNum),
            queue_lang: String(newQueue.length),
            duration: qduration,
          })}`,
        });

      pages.push(embed);
    }

    if (pages.length == pagesNum && newQueue.length > 10) {
      if (handler.message) {
        await new PageQueue(
          client,
          pages,
          60000,
          newQueue.length,
          handler.language
        ).prefixPage(handler.message, qduration);
      } else if (handler.interaction) {
        await new PageQueue(
          client,
          pages,
          60000,
          newQueue.length,
          handler.language
        ).slashPage(handler.interaction, qduration);
      } else return;
    } else return handler.editReply({ embeds: [pages[0]] });
  }
}
