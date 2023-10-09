import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";
import id from "voucher-code-generator";
import { Manager } from "../../../manager.js";

export default {
  name: ["playlist", "create"],
  description: "Create a new playlist",
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
    {
      name: "description",
      description: "The description of the playlist",
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
    const des = (
      interaction.options as CommandInteractionOptionResolver
    ).getString("description");
    if (value!.length > 16)
      return interaction.editReply(
        `${client.i18n.get(language, "playlist", "create_toolong")}`
      );
    if (des && des.length > 1000)
      return interaction.editReply(
        `${client.i18n.get(language, "playlist", "des_toolong")}`
      );

    const PlaylistName = value!.replace(/_/g, " ");
    const msg = await interaction.editReply(
      `${client.i18n.get(language, "playlist", "create_loading")}`
    );

    const fullList = await client.db.get("playlist");

    const Limit = Object.keys(fullList)
      .filter(function (key) {
        return fullList[key].owner == interaction.user.id;
        // to cast back from an array of keys to the object, with just the passing ones
      })
      .reduce(function (obj: any, key) {
        obj[key] = fullList[key];
        return obj;
      }, {});

    const Exist = Object.keys(fullList)
      .filter(function (key) {
        return (
          fullList[key].owner == interaction.user.id &&
          fullList[key].name == PlaylistName
        );
        // to cast back from an array of keys to the object, with just the passing ones
      })
      .reduce(function (obj: any, key) {
        obj[key] = fullList[key];
        return obj;
      }, {});

    if (Object.keys(Exist).length !== 0)
      return msg.edit(
        `${client.i18n.get(language, "playlist", "create_name_exist")}`
      );
    if (Object.keys(Limit).length >= client.config.bot.LIMIT_PLAYLIST) {
      msg.edit(
        `${client.i18n.get(language, "playlist", "create_limit_playlist", {
          limit: String(client.config.bot.LIMIT_PLAYLIST),
        })}`
      );
      return;
    }

    const idgen = id.generate({ length: 8, prefix: "playlist-" });

    await client.db.set(`playlist.pid_${idgen}`, {
      id: idgen[0],
      name: PlaylistName,
      owner: interaction.user.id,
      tracks: [],
      private: true,
      created: Date.now(),
      description: des ? des : null,
    });

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "playlist", "create_created", {
          playlist: PlaylistName,
        })}`
      )
      .setColor(client.color);
    return msg.edit({ content: " ", embeds: [embed] });
  },
};
