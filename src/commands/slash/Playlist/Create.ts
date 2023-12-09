import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";
import id from "voucher-code-generator";
import { Manager } from "../../../manager.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";

export default class implements SlashCommand {
  name = ["playlist", "create"];
  description = "Create a new playlist";
  category = "Playlist";
  lavalink = false;
  accessableby = Accessableby.Member;
  options = [
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
  ];

  async run(
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) {
    await interaction.deferReply({ ephemeral: false });
    const value = (
      interaction.options as CommandInteractionOptionResolver
    ).getString("name");
    const des = (
      interaction.options as CommandInteractionOptionResolver
    ).getString("description");
    if (value!.length > 16)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "create_toolong")}`
            )
            .setColor(client.color),
        ],
      });
    if (des && des.length > 1000)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "des_toolong")}`
            )
            .setColor(client.color),
        ],
      });

    const msg = await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "playlist", "create_loading")}`
          )
          .setColor(client.color),
      ],
    });

    const fullList = await client.db.playlist.all();

    const Limit = fullList.filter((data) => {
      return data.value.owner == interaction.user.id;
    });

    if (Object.keys(Limit).length >= client.config.bot.LIMIT_PLAYLIST) {
      msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(
                language,
                "playlist",
                "create_limit_playlist",
                {
                  limit: String(client.config.bot.LIMIT_PLAYLIST),
                }
              )}`
            )
            .setColor(client.color),
        ],
      });
      return;
    }

    const idgen = id.generate({ length: 8, prefix: "playlist-" });

    await client.db.playlist.set(`${idgen}`, {
      id: idgen[0],
      name: value,
      owner: interaction.user.id,
      tracks: [],
      private: true,
      created: Date.now(),
      description: des ? des : null,
    });

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "playlist", "create_created", {
          playlist: String(value),
          id: idgen[0],
        })}`
      )
      .setColor(client.color);
    return msg.edit({ content: " ", embeds: [embed] });
  }
}
