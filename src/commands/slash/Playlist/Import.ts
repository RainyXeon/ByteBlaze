import {
  EmbedBuilder,
  PermissionsBitField,
  ApplicationCommandOptionType,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
} from "discord.js";
import { ConvertTime } from "../../../structures/ConvertTime.js";
import { Playlist } from "../../../database/schema/Playlist.js";
import { Manager } from "../../../manager.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";
let playlist: Playlist | null;

export default class implements SlashCommand {
  name = ["playlist", "import"];
  description = "Import a playlist to queue.";
  category = "Playlist";
  accessableby = Accessableby.Member;
  lavalink = true;
  options = [
    {
      name: "name",
      description: "The name of the playlist",
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "id",
      description: "The id of the playlist",
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
    const id = (
      interaction.options as CommandInteractionOptionResolver
    ).getString("id");
    const { channel } = (interaction.member as GuildMember).voice;
    if (!channel)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "import_voice")}`
            )
            .setColor(client.color),
        ],
      });

    const player = await client.manager.createPlayer({
      guildId: interaction.guild!.id,
      voiceId: (interaction.member as GuildMember)!.voice.channel!.id,
      textId: interaction.channel!.id,
      deaf: true,
    });

    const SongAdd = [];
    let SongLoad = 0;

    if (id) playlist = await client.db.playlist.get(`${id}`);
    if (value) {
      const Plist = value.replace(/_/g, " ");

      const fullList = await client.db.playlist.all();

      const pid = fullList.filter(function (data) {
        return (
          data.value.owner == interaction.user.id && data.value.name == Plist
        );
      });

      playlist = pid[0].value;
    }
    if (!id && !value)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "no_id_or_name")}`
            )
            .setColor(client.color),
        ],
      });
    if (id && value)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "got_id_and_name")}`
            )
            .setColor(client.color),
        ],
      });
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

    const totalDuration = new ConvertTime().parse(
      playlist.tracks!.reduce((acc, cur) => acc + cur.length!, 0)
    );

    const msg = await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "playlist", "import_loading")}`
          )
          .setColor(client.color),
      ],
    });

    for (let i = 0; i < playlist.tracks!.length; i++) {
      const res = await player.search(playlist.tracks![i].uri, {
        requester: interaction.user,
      });
      if (res.type == "TRACK") {
        SongAdd.push(res.tracks[0]);
        SongLoad++;
      } else if (res.type == "PLAYLIST") {
        for (let t = 0; t < res.tracks.length; t++) {
          SongAdd.push(res.tracks[t]);
          SongLoad++;
        }
      } else if (res.type == "SEARCH") {
        SongAdd.push(res.tracks[0]);
        SongLoad++;
      }
      if (SongLoad == playlist.tracks!.length) {
        player.queue.add(SongAdd);
        const embed = new EmbedBuilder() // **Imported • \`${Plist}\`** (${playlist.tracks.length} tracks) • ${message.user}
          .setDescription(
            `${client.i18n.get(language, "playlist", "import_imported", {
              name: playlist.name,
              tracks: String(playlist.tracks!.length),
              duration: totalDuration,
              user: String(interaction.user),
            })}`
          )
          .setColor(client.color);

        msg.edit({ content: " ", embeds: [embed] });
        if (!player.playing) {
          player.play();
        }
      }
    }
  }
}
