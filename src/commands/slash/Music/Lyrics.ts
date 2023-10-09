import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
} from "discord.js";
import axios from "axios";
import { fetch } from "lyric-api";
import { Manager } from "../../../manager.js";

// Main code
export default {
  name: ["lyrics"],
  description: "Display lyrics of a song.",
  category: "Music",
  owner: false,
  premium: false,
  lavalink: true,
  isManager: false,
  options: [
    {
      name: "input",
      description: "The song you want to find lyrics for",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) => {
    await interaction.deferReply({ ephemeral: false });
    const msg = await interaction.editReply(
      `${client.i18n.get(language, "music", "lyrics_loading")}`
    );
    const value = (
      interaction.options as CommandInteractionOptionResolver
    ).getString("input");

    const player = client.manager.players.get(interaction.guild!.id);
    if (!player)
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_player")}`);
    const { channel } = (interaction.member as GuildMember).voice;
    if (
      !channel ||
      (interaction.member as GuildMember).voice.channel !==
        interaction.guild!.members.me!.voice.channel
    )
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_voice")}`);

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
        return msg.edit(
          `${client.i18n.get(language, "music", "lyrics_notfound")}`
        );
    } catch (err) {
      console.log(err);
      return msg.edit(
        `${client.i18n.get(language, "music", "lyrics_notfound")}`
      );
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
  },
};
