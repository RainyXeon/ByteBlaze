import { Manager } from "../../manager.js";
import { EmbedBuilder, TextChannel } from "discord.js";
import { formatDuration } from "../../utilities/FormatDuration.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { RainlinkPlayer } from "../../rainlink/main.js";
import { getTitle } from "../../utilities/GetTitle.js";

// Main code
export default class implements Command {
  public name = ["nowplaying"];
  public description = "Display the song currently playing.";
  public category = "Music";
  public accessableby = [Accessableby.Member];
  public usage = "";
  public aliases = ["np"];
  public lavalink = true;
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = false;
  public permissions = [];

  public options = [];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const realtime = client.config.player.NP_REALTIME;

    const player = client.rainlink.players.get(handler.guild!.id) as RainlinkPlayer;

    const song = player.queue.current;
    const position = player.position;
    const CurrentDuration = formatDuration(position);
    const TotalDuration = formatDuration(song!.duration);
    const Thumbnail =
      song?.artworkUrl ?? `https://img.youtube.com/vi/${song!.identifier}/maxresdefault.jpg`;
    const Part = Math.floor((position / song!.duration!) * 30);

    const fieldDataGlobal = [
      {
        name: `${client.i18n.get(handler.language, "event.player", "author_title")}`,
        value: `${song!.author}`,
        inline: true,
      },
      {
        name: `${client.i18n.get(handler.language, "event.player", "duration_title")}`,
        value: `${formatDuration(song!.duration)}`,
        inline: true,
      },
      {
        name: `${client.i18n.get(handler.language, "event.player", "volume_title")}`,
        value: `${player.volume}%`,
        inline: true,
      },
      {
        name: `${client.i18n.get(handler.language, "event.player", "queue_title")}`,
        value: `${player.queue.length}`,
        inline: true,
      },
      {
        name: `${client.i18n.get(handler.language, "event.player", "total_duration_title")}`,
        value: `${formatDuration(player.queue.duration)}`,
        inline: true,
      },
      {
        name: `${client.i18n.get(handler.language, "event.player", "request_title")}`,
        value: `${song!.requester}`,
        inline: true,
      },
      {
        name: `${client.i18n.get(handler.language, "event.player", "download_title")}`,
        value: `**[${song!.title}](https://www.000tube.com/watch?v=${song?.identifier})**`,
        inline: false,
      },
      {
        name: `${client.i18n.get(handler.language, "command.music", "np_current_duration", {
          current_duration: CurrentDuration,
          total_duration: TotalDuration,
        })}`,
        value: `\`\`\`🔴 | ${"─".repeat(Part) + "🎶" + "─".repeat(30 - Part)}\`\`\``,
        inline: false,
      },
    ];

    const embeded = new EmbedBuilder()
      .setAuthor({
        name: `${client.i18n.get(handler.language, "command.music", "np_title")}`,
        iconURL: `${client.i18n.get(handler.language, "command.music", "np_icon")}`,
      })
      .setColor(client.color)
      .setDescription(`**${getTitle(client, song!)}**`)
      .setThumbnail(Thumbnail)
      .addFields(fieldDataGlobal)
      .setTimestamp();

    const NEmbed = await handler.editReply({ content: " ", embeds: [embeded] });

    const currentNP = client.nowPlaying.get(`${handler.guild?.id}`);
    if (currentNP) {
      clearInterval(currentNP.interval);
      await currentNP.msg?.delete().catch(() => null);
      client.nowPlaying.delete(`${handler.guild?.id}`);
    }

    if (realtime) {
      const interval: NodeJS.Timeout = setInterval(async () => {
        let currentNPInterval = client.nowPlaying.get(`${handler.guild?.id}`);
        if (!currentNPInterval)
          currentNPInterval = client.nowPlaying
            .set(`${handler.guild?.id}`, {
              interval: interval,
              msg: NEmbed,
            })
            .get(`${handler.guild?.id}`);
        if (!player.queue.current) return clearInterval(interval);
        if (!player.playing) return;
        const CurrentDuration = formatDuration(player.position);
        const Part = Math.floor((player.position / song!.duration!) * 30);

        const editedField = fieldDataGlobal;

        editedField.splice(7, 1);
        editedField.push({
          name: `${client.i18n.get(handler.language, "command.music", "np_current_duration", {
            current_duration: CurrentDuration,
            total_duration: TotalDuration,
          })}`,
          value: `\`\`\`🔴 | ${"─".repeat(Part) + "🎶" + "─".repeat(30 - Part)}\`\`\``,
          inline: false,
        });

        const embeded = new EmbedBuilder()
          .setAuthor({
            name: `${client.i18n.get(handler.language, "command.music", "np_title")}`,
            iconURL: `${client.i18n.get(handler.language, "command.music", "np_icon")}`,
          })
          .setColor(client.color)
          .setDescription(`**${getTitle(client, song!)}**`)
          .setThumbnail(Thumbnail)
          .addFields(editedField)
          .setTimestamp();

        try {
          const channel = (await client.channels
            .fetch(`${handler.channel?.id}`)
            .catch(() => undefined)) as TextChannel;
          if (!channel) return;
          const message = await channel.messages
            .fetch(`${currentNPInterval?.msg?.id}`)
            .catch(() => undefined);
          if (!message) return;
          if (currentNPInterval && currentNPInterval.msg)
            currentNPInterval.msg.edit({ content: " ", embeds: [embeded] }).catch(() => null);
        } catch (err) {
          return;
        }
      }, 5000);
    } else if (!realtime) {
      if (!player.playing) return;
      if (NEmbed) NEmbed.edit({ content: " ", embeds: [embeded] }).catch(() => null);
    }
  }
}
