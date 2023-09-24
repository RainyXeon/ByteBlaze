import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";
import { Manager } from "../../../manager.js";

export default {
  name: ["playlist", "view"],
  description: "Public or private a playlist",
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
    const PName = value!.replace(/_/g, " ");

    const fullList = await client.db.get("playlist");

    const pid = Object.keys(fullList).filter(function (key) {
      return (
        fullList[key].owner == interaction.user.id &&
        fullList[key].name == PName
      );
    });

    const playlist = fullList[pid[0]];

    if (!playlist)
      return interaction.editReply(
        `${client.i18n.get(language, "playlist", "public_notfound")}`
      );
    if (playlist.owner !== interaction.user.id)
      return interaction.editReply(
        `${client.i18n.get(language, "playlist", "public_owner")}`
      );

    const Public = Object.keys(fullList)
      .filter(function (key) {
        return fullList[key].private == false && fullList[key].name == PName;
        // to cast back from an array of keys to the object, with just the passing ones
      })
      .forEach(async (key) => {
        return fullList[key];
      });

    if (Public !== null || undefined || false)
      return interaction.editReply(
        `${client.i18n.get(language, "playlist", "public_already")}`
      );

    const msg = await interaction.editReply(
      `${client.i18n.get(language, "playlist", "public_loading")}`
    );

    client.db.set(
      `playlist.pid_${playlist.id}.private`,
      playlist.private == true ? false : true
    );

    const playlist_now = await client.db.get(
      `playlist.pid_${playlist.id}.private`
    );

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "playlist", "public_success", {
          view: playlist_now == true ? "Private" : "Public",
        })}`
      )
      .setColor(client.color);
    msg.edit({ content: " ", embeds: [embed] });
  },
};
