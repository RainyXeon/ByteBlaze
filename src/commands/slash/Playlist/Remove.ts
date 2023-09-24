import {
  EmbedBuilder,
  CommandInteraction,
  ApplicationCommandOptionType,
  CommandInteractionOptionResolver,
} from "discord.js";
import { Manager } from "../../../manager.js";

export default {
  name: ["playlist", "remove"],
  description: "Remove a song from a playlist",
  category: "Playlist",
  options: [
    {
      name: "name",
      description: "The name of the playlist",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "postion",
      description: "The position of the song",
      required: true,
      type: ApplicationCommandOptionType.Integer,
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
    const pos = (
      interaction.options as CommandInteractionOptionResolver
    ).getInteger("postion");

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
        `${client.i18n.get(language, "playlist", "remove_notfound")}`
      );
    if (playlist.owner !== interaction.user.id)
      return interaction.editReply(
        `${client.i18n.get(language, "playlist", "remove_owner")}`
      );

    const position = pos;

    const song = playlist.tracks[position! - 1];
    if (!song)
      return interaction.editReply(
        `${client.i18n.get(language, "playlist", "remove_song_notfound")}`
      );

    await client.db.pull(
      `playlist.${pid[0]}.tracks`,
      playlist.tracks[position! - 1]
    );

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "playlist", "remove_removed", {
          name: Plist,
          position: String(pos),
        })}`
      )
      .setColor(client.color);
    interaction.editReply({ embeds: [embed] });
  },
};
