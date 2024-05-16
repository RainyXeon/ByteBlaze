import { EmbedBuilder, User } from "discord.js";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { FormatDuration } from "../../utilities/FormatDuration.js";
import { PageQueue } from "../../structures/PageQueue.js";
import { RainlinkPlayer, RainlinkTrack } from "../../rainlink/main.js";

// Main code
export default class implements Command {
  public name = ["shuffle"];
  public description = "Shuffle song in queue!";
  public category = "Music";
  public accessableby = [Accessableby.Member];
  public usage = "";
  public aliases = [];
  public lavalink = true;
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = true;
  public permissions = [];
  public options = [];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const player = client.rainlink.players.get(handler.guild!.id) as RainlinkPlayer;

    const newQueue = await player.queue.shuffle();

    const song = newQueue.current;

    const qduration = `${new FormatDuration().parse(song!.duration + player.queue.duration)}`;
    const thumbnail = `https://img.youtube.com/vi/${song!.identifier}/hqdefault.jpg`;

    let pagesNum = Math.ceil(newQueue.length / 10);
    if (pagesNum === 0) pagesNum = 1;

    const songStrings = [];
    for (let i = 0; i < newQueue.length; i++) {
      const song = newQueue[i];
      songStrings.push(
        `**${i + 1}.** ${this.getTitle(client, song)} \`[${new FormatDuration().parse(song.duration)}]\`
                    `
      );
    }

    const pages = [];
    for (let i = 0; i < pagesNum; i++) {
      const str = songStrings.slice(i * 10, i * 10 + 10).join("");

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${client.getString(handler.language, "command.music", "shuffle_msg")}`,
        })
        .setThumbnail(thumbnail)
        .setColor(client.color)
        .setDescription(
          `${client.getString(handler.language, "command.music", "queue_description", {
            title: this.getTitle(client, song!),
            request: String(song!.requester),
            duration: new FormatDuration().parse(song!.duration),
            rest: str == "" ? "  Nothing" : "\n" + str,
          })}`
        )
        .setFooter({
          text: `${client.getString(handler.language, "command.music", "queue_footer", {
            page: String(i + 1),
            pages: String(pagesNum),
            queue_lang: String(newQueue.length),
            duration: qduration,
          })}`,
        });

      pages.push(embed);
    }

    client.wsl.get(handler.guild!.id)?.send({
      op: "playerQueueShuffle",
      guild: handler.guild!.id,
      queue: player.queue.map((track) => {
        const requesterQueue = track.requester as User;
        return {
          title: track.title,
          uri: track.uri,
          length: track.duration,
          thumbnail: track.artworkUrl,
          author: track.author,
          requester: requesterQueue
            ? {
                id: requesterQueue.id,
                username: requesterQueue.username,
                globalName: requesterQueue.globalName,
                defaultAvatarURL: requesterQueue.defaultAvatarURL ?? null,
              }
            : null,
        };
      }),
    });

    if (pages.length == pagesNum && newQueue.length > 10) {
      if (handler.message) {
        await new PageQueue(client, pages, 60000, newQueue.length, handler.language).prefixPage(
          handler.message,
          qduration
        );
      } else if (handler.interaction) {
        await new PageQueue(client, pages, 60000, newQueue.length, handler.language).slashPage(
          handler.interaction,
          qduration
        );
      } else return;
    } else return handler.editReply({ embeds: [pages[0]] });
  }

  getTitle(client: Manager, tracks: RainlinkTrack): string {
    if (client.config.lavalink.AVOID_SUSPEND) return tracks.title;
    else {
      return `[${tracks.title}](${tracks.uri})`;
    }
  }
}
