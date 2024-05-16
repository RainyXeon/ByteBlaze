import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { ConvertTime } from "../../utilities/ConvertTime.js";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { AutocompleteInteractionChoices, GlobalInteraction } from "../../@types/Interaction.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { RainlinkPlayer, RainlinkSearchResultType, RainlinkTrack } from "../../rainlink/main.js";

export default class implements Command {
  public name = ["play"];
  public description = "Play a song from any types";
  public category = "Music";
  public accessableby = [Accessableby.Member];
  public usage = "<name_or_url>";
  public aliases = ["p", "pl", "pp"];
  public lavalink = true;
  public playerCheck = false;
  public usingInteraction = true;
  public sameVoiceCheck = false;
  public permissions = [];
  public options = [
    {
      name: "search",
      description: "The song link or name",
      type: ApplicationCommandOptionType.String,
      required: true,
      autocomplete: true,
    },
  ];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    let player = client.rainlink.players.get(handler.guild!.id) as RainlinkPlayer;

    const value = handler.args.join(" ");

    if (!value)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.music", "play_arg")}`)
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

    const emotes = (str: string) => str.match(/<a?:.+?:\d{18}>|\p{Extended_Pictographic}/gu);

    if (emotes(value) !== null)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.music", "play_emoji")}`)
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
    else if (player && !this.checkSameVoice(client, handler, handler.language)) {
      return;
    }

    const result = await player.search(value, { requester: handler.user });
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

    if (result.type === "TRACK") {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.getString(handler.language, "command.music", "play_track", {
            title: this.getTitle(client, result.type, tracks),
            duration: new ConvertTime().parse(tracks[0].duration as number),
            request: String(tracks[0].requester),
          })}`
        )
        .setColor(client.color);

      handler.editReply({ content: " ", embeds: [embed] });
      if (!player.playing) player.play();
    } else if (result.type === "PLAYLIST") {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.getString(handler.language, "command.music", "play_playlist", {
            title: this.getTitle(client, result.type, tracks, value),
            duration: new ConvertTime().parse(TotalDuration),
            songs: String(tracks.length),
            request: String(tracks[0].requester),
          })}`
        )
        .setColor(client.color);

      handler.editReply({ content: " ", embeds: [embed] });
      if (!player.playing) player.play();
    } else if (result.type === "SEARCH") {
      const embed = new EmbedBuilder().setColor(client.color).setDescription(
        `${client.getString(handler.language, "command.music", "play_result", {
          title: this.getTitle(client, result.type, tracks),
          duration: new ConvertTime().parse(tracks[0].duration as number),
          request: String(tracks[0].requester),
        })}`
      );

      handler.editReply({ content: " ", embeds: [embed] });
      if (!player.playing) player.play();
    }
  }

  checkSameVoice(client: Manager, handler: CommandHandler, language: string) {
    if (handler.member!.voice.channel !== handler.guild!.members.me!.voice.channel) {
      handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "error", "no_same_voice")}`)
            .setColor(client.color),
        ],
      });
      return false;
    }

    return true;
  }

  getTitle(client: Manager, type: RainlinkSearchResultType, tracks: RainlinkTrack[], value?: string): string {
    if (client.config.lavalink.AVOID_SUSPEND) return tracks[0].title;
    else {
      if (type === "PLAYLIST") {
        return `[${tracks[0].title}](${value})`;
      } else {
        return `[${tracks[0].title}](${tracks[0].uri})`;
      }
    }
  }

  // Autocomplete function
  async autocomplete(client: Manager, interaction: GlobalInteraction, language: string) {
    let choice: AutocompleteInteractionChoices[] = [];
    const url = String((interaction as CommandInteraction).options.get("search")!.value);

    const Random =
      client.config.lavalink.AUTOCOMPLETE_SEARCH[
        Math.floor(Math.random() * client.config.lavalink.AUTOCOMPLETE_SEARCH.length)
      ];

    const match = client.REGEX.some((match) => {
      return match.test(url) == true;
    });

    if (match == true) {
      choice.push({ name: url, value: url });
      await (interaction as AutocompleteInteraction).respond(choice).catch(() => {});
      return;
    }

    if (client.lavalinkUsing.length == 0) {
      choice.push({
        name: `${client.getString(language, "command.music", "no_node")}`,
        value: `${client.getString(language, "command.music", "no_node")}`,
      });
      return;
    }
    const searchRes = await client.rainlink.search(url || Random);

    if (searchRes.tracks.length == 0 || !searchRes.tracks) {
      return choice.push({ name: "Error song not matches", value: url });
    }

    for (let i = 0; i < 10; i++) {
      const x = searchRes.tracks[i];
      choice.push({
        name: x && x.title ? x.title : "Unknown track name",
        value: x && x.uri ? x.uri : url,
      });
    }

    await (interaction as AutocompleteInteraction).respond(choice).catch(() => {});
  }
}
