import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
} from "discord.js";
import axios from "axios";
import { Manager } from "../../../manager.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";

// Main code
export default class implements SlashCommand {
  name = ["lyrics"];
  description = "Display lyrics of a song.";
  category = "Music";
  lavalink = true;
  accessableby = Accessableby.Member;
  options = [
    {
      name: "input",
      description: "The song you want to find lyrics for",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ];
  async run(
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) {
    await interaction.deferReply({ ephemeral: false });
    const value = (
      interaction.options as CommandInteractionOptionResolver
    ).getString("input");

    const msg = await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "lyrics_loading")}`
          )
          .setColor(client.color),
      ],
    });

    const player = client.manager.players.get(interaction.guild!.id);
    if (!player)
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_player")}`
            )
            .setColor(client.color),
        ],
      });
    const { channel } = (interaction.member as GuildMember)!.voice;
    if (
      !channel ||
      (interaction.member as GuildMember)!.voice.channel !==
        interaction.guild!.members.me!.voice.channel
    )
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_voice")}`
            )
            .setColor(client.color),
        ],
      });

    let song = value;
    let CurrentSong = player.queue.current;
    if (!song && CurrentSong)
      song = CurrentSong.title + " " + CurrentSong.author;

    let lyrics_data = null;

    const fetch_lyrics = await axios.get(
      `https://api.popcat.xyz/lyrics?song=${song!.replace(/ /g, "+")}`
    );
    try {
      lyrics_data = fetch_lyrics.data.lyrics;
      if (!lyrics_data)
        return msg.edit({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "music", "lyrics_notfound")}`
              )
              .setColor(client.color),
          ],
        });
    } catch (err) {
      console.log(err);
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "lyrics_notfound")}`
            )
            .setColor(client.color),
        ],
      });
    }
    let lyricsEmbed = new EmbedBuilder()
      .setColor(client.color)
      .setTitle(
        `${client.i18n.get(language, "music", "lyrics_title", {
          song: String(song),
        })}`
      )
      .setDescription(`${lyrics_data}`)
      .setFooter({ text: `Requested by ${interaction.user.username}` })
      .setTimestamp();

    if (lyrics_data.length > 2048) {
      lyricsEmbed.setDescription(
        `${client.i18n.get(language, "music", "lyrics_toolong")}`
      );
    }

    msg.edit({ content: " ", embeds: [lyricsEmbed] });
  }
}
