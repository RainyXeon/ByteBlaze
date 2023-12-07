import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";
import { Manager } from "../../../manager.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";

export default class implements SlashCommand {
  name = ["playlist", "view"];
  description = "Public or private a playlist";
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
  }
}
