import { Manager } from "../../manager.js";
import { EmbedBuilder, Message, NewsChannel } from "discord.js";
import { FormatDuration } from "../../utilities/FormatDuration.js";
import { QueueDuration } from "../../utilities/QueueDuration.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { KazagumoPlayer } from "../../lib/main.js";

// Main code
export default class implements Command {
  public name = ["nowplaying"];
  public description = "Display the song currently playing.";
  public category = "Music";
  public accessableby = Accessableby.Member;
  public usage = "";
  public aliases = ["np"];
  public lavalink = true;
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = false;
  public options = [];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const realtime = client.config.lavalink.NP_REALTIME;

    const player = client.manager.players.get(
      handler.guild!.id
    ) as KazagumoPlayer;

    const song = player.queue.current;
    const position = player.position;
    const CurrentDuration = new FormatDuration().parse(position);
    const TotalDuration = new FormatDuration().parse(song!.length);
    const Thumbnail =
      `https://img.youtube.com/vi/${song!.identifier}/maxresdefault.jpg` ||
      `https://cdn.discordapp.com/avatars/${client.user!.id}/${
        client.user!.avatar
      }.jpeg`;
    const Part = Math.floor((position / song!.length!) * 30);

    const fieldDataGlobal = [
      {
        name: `${client.i18n.get(handler.language, "player", "author_title")}`,
        value: `${song!.author}`,
        inline: true,
      },
      {
        name: `${client.i18n.get(
          handler.language,
          "player",
          "duration_title"
        )}`,
        value: `${new FormatDuration().parse(song!.length)}`,
        inline: true,
      },
      {
        name: `${client.i18n.get(handler.language, "player", "volume_title")}`,
        value: `${player.volume * 100}%`,
        inline: true,
      },
      {
        name: `${client.i18n.get(handler.language, "player", "queue_title")}`,
        value: `${player.queue.length}`,
        inline: true,
      },
      {
        name: `${client.i18n.get(
          handler.language,
          "player",
          "total_duration_title"
        )}`,
        value: `${new FormatDuration().parse(
          new QueueDuration().parse(player)
        )}`,
        inline: true,
      },
      {
        name: `${client.i18n.get(handler.language, "player", "request_title")}`,
        value: `${song!.requester}`,
        inline: true,
      },
      {
        name: `${client.i18n.get(
          handler.language,
          "player",
          "download_title"
        )}`,
        value: `**[${
          song!.title
        } - y2mate.com](https://www.y2mate.com/youtube/${song!.identifier})**`,
        inline: false,
      },
      {
        name: `${client.i18n.get(
          handler.language,
          "music",
          "np_current_duration",
          {
            current_duration: CurrentDuration,
            total_duration: TotalDuration,
          }
        )}`,
        value: `\`\`\`🔴 | ${
          "─".repeat(Part) + "🎶" + "─".repeat(30 - Part)
        }\`\`\``,
        inline: false,
      },
    ];

    const embeded = new EmbedBuilder()
      .setAuthor({
        name: `${client.i18n.get(handler.language, "music", "np_title")}`,
        iconURL: `${client.i18n.get(handler.language, "music", "np_icon")}`,
      })
      .setColor(client.color)
      .setDescription(`**[${song!.title}](${song!.uri})**`)
      .setThumbnail(Thumbnail)
      .addFields(fieldDataGlobal)
      .setTimestamp();

    const NEmbed = await handler.editReply({ content: " ", embeds: [embeded] });

    const currentNP = client.nowPlaying.get(`${handler.guild?.id}`);
    if (currentNP) {
      clearInterval(currentNP.interval);
      await currentNP.msg?.delete();
      client.nowPlaying.delete(`${handler.guild?.id}`);
    }

    if (realtime) {
      const interval: NodeJS.Timeout = setInterval(async () => {
        const currentNPInterval = client.nowPlaying.get(`${handler.guild?.id}`);
        if (!currentNPInterval)
          client.nowPlaying.set(`${handler.guild?.id}`, {
            interval: interval,
            msg: NEmbed,
          });
        if (!player.queue.current) return clearInterval(interval);
        if (!player.playing) return;
        const CurrentDuration = new FormatDuration().parse(player.position);
        const Part = Math.floor((player.position / song!.length!) * 30);

        const editedField = fieldDataGlobal;

        editedField.splice(7, 1);
        editedField.push({
          name: `${client.i18n.get(
            handler.language,
            "music",
            "np_current_duration",
            {
              current_duration: CurrentDuration,
              total_duration: TotalDuration,
            }
          )}`,
          value: `\`\`\`🔴 | ${
            "─".repeat(Part) + "🎶" + "─".repeat(30 - Part)
          }\`\`\``,
          inline: false,
        });

        const embeded = new EmbedBuilder()
          .setAuthor({
            name: `${client.i18n.get(handler.language, "music", "np_title")}`,
            iconURL: `${client.i18n.get(handler.language, "music", "np_icon")}`,
          })
          .setColor(client.color)
          .setDescription(`**[${song!.title}](${song!.uri})**`)
          .setThumbnail(Thumbnail)
          .addFields(editedField)
          .setTimestamp();

        if (NEmbed) NEmbed.edit({ content: " ", embeds: [embeded] });
      }, 5000);
    } else if (!realtime) {
      if (!player.playing) return;
      if (NEmbed) NEmbed.edit({ content: " ", embeds: [embeded] });
    }
  }
}
