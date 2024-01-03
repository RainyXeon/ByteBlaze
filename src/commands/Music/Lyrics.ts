import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  Message,
} from "discord.js";
import { Manager } from "../../manager.js";
import axios from "axios";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { KazagumoPlayer } from "kazagumo.mod";

// Main code
export default class implements Command {
  public name = ["lyrics"];
  public description = "Display lyrics of a song.";
  public category = "Music";
  public accessableby = Accessableby.Member;
  public usage = "<song_name>";
  public aliases = [];
  public lavalink = true;
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = true;
  public options = [
    {
      name: "input",
      description: "The song you want to find lyrics for",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const value = handler.args[0];

    const player = client.manager.players.get(
      handler.guild!.id
    ) as KazagumoPlayer;

    let song = value;
    let CurrentSong = player.queue.current;
    if (!song && CurrentSong)
      song = CurrentSong.title + " " + CurrentSong.author;

    let lyrics = null;

    const fetch_lyrics = await axios.get(
      `https://api.popcat.xyz/lyrics?song=${song!.replace(/ /g, "+")}`
    );

    try {
      lyrics = fetch_lyrics.data.lyrics;
      if (!lyrics)
        return handler.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(
                  handler.language,
                  "music",
                  "lyrics_notfound"
                )}`
              )
              .setColor(client.color),
          ],
        });
    } catch (err) {
      client.logger.log({ level: "error", message: String(err) });
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(handler.language, "music", "lyrics_notfound")}`
            )
            .setColor(client.color),
        ],
      });
    }
    let lyricsEmbed = new EmbedBuilder()
      .setColor(client.color)
      .setTitle(
        `${client.i18n.get(handler.language, "music", "lyrics_title", {
          song: song,
        })}`
      )
      .setDescription(`${lyrics}`)
      .setFooter({ text: `Requested by ${handler.user?.username}` })
      .setTimestamp();

    if (lyrics.length > 2048) {
      lyricsEmbed.setDescription(
        `${client.i18n.get(handler.language, "music", "lyrics_toolong")}`
      );
    }

    handler.editReply({ content: " ", embeds: [lyricsEmbed] });
  }
}
