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
  owner: false,
  premium: false,
  lavalink: false,
  isManager: false,
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

    const fullList = await client.db.playlist.all();

    const pid = fullList.filter(function (data) {
      return (
        data.value.owner == interaction.user.id && data.value.name == PName
      );
    });

    const playlist = pid[0].value;

    if (!playlist)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "public_notfound")}`
            )
            .setColor(client.color),
        ],
      });
    if (playlist.owner !== interaction.user.id)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "public_owner")}`
            )
            .setColor(client.color),
        ],
      });

    const Public = fullList.filter(function (data) {
      return data.value.private == false && data.value.name == PName;
      // to cast back from an array of keys to the object, with just the passing ones
    });

    if (Public !== null || undefined || false || Public !== 0)
      return interaction.editReply(
        `${client.i18n.get(language, "playlist", "public_already")}`
      );

    const msg = await interaction.editReply(
      `${client.i18n.get(language, "playlist", "public_loading")}`
    );

    client.db.playlist.set(
      `${playlist.id}.private`,
      playlist.private == true ? false : true
    );

    const playlist_now = await client.db.playlist.get(`${playlist.id}.private`);

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "playlist", "public_success", {
          view: playlist_now?.private == true ? "Private" : "Public",
        })}`
      )
      .setColor(client.color);
    msg.edit({ content: " ", embeds: [embed] });
  },
};
