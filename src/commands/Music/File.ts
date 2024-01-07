import {
  ApplicationCommandOptionType,
  Attachment,
  Collection,
  EmbedBuilder,
  Message,
  PermissionsBitField,
} from "discord.js";
import { Manager } from "../../manager.js";
import { StartQueueDuration } from "../../utilities/QueueDuration.js";
import { ConvertTime } from "../../utilities/ConvertTime.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

// Main code
export default class implements Command {
  public name = ["file"];
  public description = "Play the music file for the bot";
  public category = "Music";
  public accessableby = Accessableby.Member;
  public usage = "";
  public aliases = ["file", "f"];
  public lavalink = true;
  public playerCheck = false;
  public usingInteraction = true;
  public sameVoiceCheck = false;
  public options = [
    {
      name: "type",
      description: "The music file to play",
      type: ApplicationCommandOptionType.Attachment,
    },
  ];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    let player = client.manager.players.get(handler.guild!.id);

    const file: Attachment = handler.attactments[0];

    const msg = await handler.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(handler.language, "music", "file_loading", {
              result: file.name,
            })}`
          )
          .setColor(client.color),
      ],
    });

    const { channel } = handler.member!.voice;
    if (!channel)
      return msg?.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(handler.language, "noplayer", "no_voice")}`
            )
            .setColor(client.color),
        ],
      });

    if (file.contentType !== "audio/mpeg" && file.contentType !== "audio/ogg")
      return msg?.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(
                handler.language,
                "music",
                "play_invalid_file"
              )}`
            )
            .setColor(client.color),
        ],
      });
    if (!file.contentType)
      msg?.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(
                handler.language,
                "music",
                "play_warning_file"
              )}`
            )
            .setColor(client.color),
        ],
      });

    if (!player)
      player = await client.manager.createPlayer({
        guildId: handler.guild!.id,
        voiceId: handler.member!.voice.channel!.id,
        textId: handler.channel!.id,
        deaf: true,
      });

    const result = await player.search(file.url, {
      requester: handler.user,
    });
    const tracks = result.tracks;

    if (!result.tracks.length)
      return msg?.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(handler.language, "music", "play_match")}`
            )
            .setColor(client.color),
        ],
      });
    if (result.type === "PLAYLIST")
      for (let track of tracks) player.queue.add(track);
    else if (player.playing && result.type === "SEARCH")
      player.queue.add(tracks[0]);
    else if (player.playing && result.type !== "SEARCH")
      for (let track of tracks) player.queue.add(track);
    else player.queue.add(tracks[0]);

    const TotalDuration = new StartQueueDuration().parse(tracks);

    if (handler.message) await handler.message.delete();

    if (result.type === "PLAYLIST") {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(handler.language, "music", "play_playlist", {
            title: file.name,
            url: file.url,
            duration: new ConvertTime().parse(TotalDuration),
            songs: String(tracks.length),
            request: String(tracks[0].requester),
          })}`
        )
        .setColor(client.color);
      msg?.edit({ content: " ", embeds: [embed] });
      if (!player.playing) player.play();
    } else if (result.type === "TRACK") {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(handler.language, "music", "play_track", {
            title: file.name,
            url: file.url,
            duration: new ConvertTime().parse(tracks[0].length as number),
            request: String(tracks[0].requester),
          })}`
        )
        .setColor(client.color);
      msg?.edit({ content: " ", embeds: [embed] });
      if (!player.playing) player.play();
    } else if (result.type === "SEARCH") {
      const embed = new EmbedBuilder().setColor(client.color).setDescription(
        `${client.i18n.get(handler.language, "music", "play_result", {
          title: file.name,
          url: file.url,
          duration: new ConvertTime().parse(tracks[0].length as number),
          request: String(tracks[0].requester),
        })}`
      );
      msg?.edit({ content: " ", embeds: [embed] });
      if (!player.playing) player.play();
    } else {
      msg?.edit(`${client.i18n.get(handler.language, "music", "play_match")}`);
      player.destroy();
    }
  }
}
