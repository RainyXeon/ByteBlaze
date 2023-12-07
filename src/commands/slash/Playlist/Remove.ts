import {
  EmbedBuilder,
  CommandInteraction,
  ApplicationCommandOptionType,
  CommandInteractionOptionResolver,
} from "discord.js";
import { Manager } from "../../../manager.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";

export default class implements SlashCommand {
  name = ["playlist", "remove"];
  description = "Remove a song from a playlist";
  category = "Playlist";
  accessableby = Accessableby.Member;
  lavalink = false;
  options = [
    {
      name: "id",
      description: "The id of the playlist",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "postion",
      description: "The position of the song",
      required: true,
      type: ApplicationCommandOptionType.Integer,
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
    const pos = (
      interaction.options as CommandInteractionOptionResolver
    ).getInteger("postion");

    const playlist = await client.db.playlist.get(value!);

    if (!playlist)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "invalid")}`
            )
            .setColor(client.color),
        ],
      });

    if (playlist.private && playlist.owner !== interaction.user.id) {
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "import_private")}`
            )
            .setColor(client.color),
        ],
      });
      return;
    }

    const position = pos;

    const song = playlist.tracks![position! - 1];
    if (!song)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "remove_song_notfound")}`
            )
            .setColor(client.color),
        ],
      });

    await client.db.playlist.pull(
      `${value}.tracks`,
      playlist.tracks![position! - 1]
    );

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "playlist", "remove_removed", {
          name: value!,
          position: String(pos),
        })}`
      )
      .setColor(client.color);
    interaction.editReply({ embeds: [embed] });
  }
}
