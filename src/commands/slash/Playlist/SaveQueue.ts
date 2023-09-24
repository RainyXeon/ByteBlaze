import { KazagumoTrack } from "kazagumo";
import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  GuildMember,
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";
import { Manager } from "../../../manager.js";

const TrackAdd: KazagumoTrack[] = [];
const TrackExist: string[] = [];
let Result: KazagumoTrack[] | null = null;

export default {
  name: ["playlist", "save", "queue"],
  description: "Save the current queue to a playlist",
  category: "Playlist",
  options: [
    {
      name: "name",
      description: "The name of the playlist",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ],
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) => {
    await interaction.deferReply({ ephemeral: false });

    const value = (
      interaction.options as CommandInteractionOptionResolver
    ).getString("name");
    const Plist = value!.replace(/_/g, " ");
    const fullList = await client.db.get("playlist");

    const pid = Object.keys(fullList).filter(function (key) {
      return (
        fullList[key].owner == interaction.user.id &&
        fullList[key].name == Plist
      );
    });

    const playlist = fullList[pid[0]];

    if (!playlist)
      return interaction.editReply(
        `${client.i18n.get(language, "playlist", "savequeue_notfound")}`
      );
    if (playlist.owner !== interaction.user.id)
      return interaction.editReply(
        `${client.i18n.get(language, "playlist", "savequeue_owner")}`
      );

    const player = client.manager.players.get(interaction.guild!.id);
    if (!player)
      return interaction.editReply(
        `${client.i18n.get(language, "noplayer", "no_player")}`
      );

    const { channel } = (interaction.member as GuildMember).voice;
    if (
      !channel ||
      (interaction.member as GuildMember).voice.channel !==
        interaction.guild!.members.me!.voice.channel
    )
      return interaction.editReply(
        `${client.i18n.get(language, "noplayer", "no_voice")}`
      );

    const queue = player.queue.map((track) => track);
    const current = player.queue.current;

    TrackAdd.push(current as KazagumoTrack);
    TrackAdd.push(...queue);

    if (!playlist && playlist.tracks.length === 0) Result = TrackAdd;

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
            name: Plist,
          })}`
        )
        .setColor(client.color);
      return interaction.editReply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "playlist", "savequeue_saved", {
          name: Plist,
          tracks: String(Result!.length),
        })}`
      )
      .setColor(client.color);
    await interaction.editReply({ embeds: [embed] });

    Result!.forEach(async (track) => {
      await client.db.push(`playlist.${pid[0]}.tracks`, {
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
  },
};
