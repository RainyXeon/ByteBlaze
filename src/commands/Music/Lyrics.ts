import { ApplicationCommandOptionType, EmbedBuilder, Message } from "discord.js";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { Lyricist } from "@execaman/lyricist";

// Main code
export default class implements Command {
  public name = ["lyrics"];
  public description = "Make the bot join the voice channel.";
  public category = "Music";
  public accessableby = [Accessableby.Member];
  public usage = "Display lyrics of the song";
  public aliases = ["ly"];
  public lavalink = true;
  public playerCheck = false;
  public usingInteraction = true;
  public sameVoiceCheck = false;
  public permissions = [];
  public options = [
    {
      name: "search",
      description: "The song name",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();
    const lyrics = new Lyricist({
      plugins: [],
      saveLastResult: false,
    });

    // Keep it short, around 30
    // characters in length
    let lyricsRes = null;
    const query = handler.args.join(" ");

    try {
      const result = await lyrics.fetch(query, 3);
      lyricsRes = result.lyrics;
      if (!lyricsRes)
        return handler.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`${client.getString(handler.language, "command.music", "lyrics_notfound")}`)
              .setColor(client.color),
          ],
        });
    } catch (err) {
      console.log(err);
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.music", "lyrics_notfound")}`)
            .setColor(client.color),
        ],
      });
    }

    const embed = new EmbedBuilder()
      .setColor(client.color)
      .setTitle(
        `${client.getString(handler.language, "command.music", "lyrics_title", {
          song: query,
        })}`
      )
      .setDescription(`${lyricsRes}`)
      .setTimestamp();

    if (lyricsRes.length > 4096) {
      embed.setDescription(`${client.getString(handler.language, "command.music", "lyrics_toolong")}`);
    }

    return handler.editReply({ embeds: [embed] });
  }
}
