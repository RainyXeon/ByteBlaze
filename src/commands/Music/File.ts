import { ApplicationCommandOptionType, Attachment, EmbedBuilder } from "discord.js";
import { Manager } from "../../manager.js";
import { ConvertTime } from "../../utilities/ConvertTime.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

// Main code
export default class implements Command {
  public name = ["file"];
  public description = "Play the music file for the bot";
  public category = "Music";
  public accessableby = [Accessableby.Member];
  public usage = "";
  public aliases = ["file", "f"];
  public lavalink = true;
  public playerCheck = false;
  public usingInteraction = true;
  public sameVoiceCheck = false;
  public permissions = [];

  public options = [
    {
      name: "type",
      description: "The music file to play",
      type: ApplicationCommandOptionType.Attachment,
    },
  ];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    let player = client.rainlink.players.get(handler.guild!.id);

    const file: Attachment = handler.attactments[0];

    if (!file)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.music", "file_notfound")}`)
            .setColor(client.color),
        ],
      });

    const { channel } = handler.member!.voice;
    if (!channel)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "error", "no_in_voice")}`)
            .setColor(client.color),
        ],
      });

    if (file.contentType !== "audio/mpeg" && file.contentType !== "audio/ogg")
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.music", "play_invalid_file")}`)
            .setColor(client.color),
        ],
      });
    if (!file.contentType)
      handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.music", "play_warning_file")}`)
            .setColor(client.color),
        ],
      });

    if (!player)
      player = await client.rainlink.create({
        guildId: handler.guild!.id,
        voiceId: handler.member!.voice.channel!.id,
        textId: handler.channel!.id,
        shardId: handler.guild?.shardId ?? 0,
        deaf: true,
        volume: client.config.lavalink.DEFAULT_VOLUME ?? 100,
      });

    const result = await player.search(file.url, {
      requester: handler.user,
    });
    const tracks = result.tracks;

    if (!result.tracks.length)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.music", "play_match")}`)
            .setColor(client.color),
        ],
      });
    if (result.type === "PLAYLIST") for (let track of tracks) player.queue.add(track);
    else if (player.playing && result.type === "SEARCH") player.queue.add(tracks[0]);
    else if (player.playing && result.type !== "SEARCH") for (let track of tracks) player.queue.add(track);
    else player.queue.add(tracks[0]);

    const TotalDuration = player.queue.duration;

    if (handler.message) await handler.message.delete().catch(() => null);

    if (result.type === "PLAYLIST") {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.getString(handler.language, "command.music", "play_playlist", {
            title: file.name,
            duration: new ConvertTime().parse(TotalDuration),
            songs: String(tracks.length),
            request: String(tracks[0].requester),
          })}`
        )
        .setColor(client.color);
      handler.editReply({ content: " ", embeds: [embed] });
      if (!player.playing) player.play();
    } else if (result.type === "TRACK") {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.getString(handler.language, "command.music", "play_track", {
            title: file.name,
            duration: new ConvertTime().parse(tracks[0].duration as number),
            request: String(tracks[0].requester),
          })}`
        )
        .setColor(client.color);
      handler.editReply({ content: " ", embeds: [embed] });
      if (!player.playing) player.play();
    } else if (result.type === "SEARCH") {
      const embed = new EmbedBuilder().setColor(client.color).setDescription(
        `${client.getString(handler.language, "command.music", "play_result", {
          title: file.name,
          duration: new ConvertTime().parse(tracks[0].duration as number),
          request: String(tracks[0].requester),
        })}`
      );
      handler.editReply({ content: " ", embeds: [embed] });
      if (!player.playing) player.play();
    } else {
      handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.music", "play_match")}`)
            .setColor(client.color),
        ],
      });
      player.data.set("sudo-destroy", true);
      const is247 = await client.db.autoreconnect.get(`${handler.guild?.id}`);
      player.stop(is247 && is247.twentyfourseven ? false : true);
    }
  }
}
