import { KazagumoTrack } from "better-kazagumo";
import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  GuildMember,
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";
import { Manager } from "../../../manager.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";

const TrackAdd: KazagumoTrack[] = [];
const TrackExist: string[] = [];
let Result: KazagumoTrack[] | null = null;

export default class implements SlashCommand {
  name = ["playlist", "save", "queue"];
  description = "Save the current queue to a playlist";
  category = "Playlist";
  accessableby = Accessableby.Member;
  lavalink = true;
  options = [
    {
      name: "id",
      description: "The id of the playlist",
      required: true,
      type: ApplicationCommandOptionType.String,
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
    ).getString("id");

    const playlist = await client.db.playlist.get(value!);

    if (!playlist)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "savequeue_notfound")}`
            )
            .setColor(client.color),
        ],
      });
    if (playlist.owner !== interaction.user.id)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "savequeue_owner")}`
            )
            .setColor(client.color),
        ],
      });

    const player = client.manager.players.get(interaction.guild!.id);
    if (!player)
      return interaction.editReply({
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
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_voice")}`
            )
            .setColor(client.color),
        ],
      });

    const queue = player.queue.map((track) => track);
    const current = player.queue.current;

    TrackAdd.push(current as KazagumoTrack);
    TrackAdd.push(...queue);

    if (!playlist) Result = TrackAdd;

    if (playlist.tracks) {
      for (let i = 0; i < playlist.tracks.length; i++) {
        const element = playlist.tracks[i].uri;
        TrackExist.push(element);
      }
      Result = TrackAdd.filter((track) => !TrackExist.includes(track.uri));
    }

    if (Result!.length == 0) {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "playlist", "savequeue_no_new_saved", {
            name: value!,
          })}`
        )
        .setColor(client.color);
      return interaction.editReply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "playlist", "savequeue_saved", {
          name: value!,
          tracks: String(Result!.length),
        })}`
      )
      .setColor(client.color);
    await interaction.editReply({ embeds: [embed] });

    Result!.forEach(async (track) => {
      await client.db.playlist.push(`${value}.tracks`, {
        title: track.title,
        uri: track.uri,
        length: track.length,
        thumbnail: track.thumbnail,
        author: track.author,
        requester: track.requester, // Just case can push
      });
    });

    TrackAdd.length = 0;
    TrackExist.length = 0;
    Result = null;
  }
}
