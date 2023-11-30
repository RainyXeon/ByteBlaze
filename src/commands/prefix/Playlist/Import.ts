import {
  EmbedBuilder,
  PermissionsBitField,
  ApplicationCommandOptionType,
  Message,
} from "discord.js";
import { ConvertTime } from "../../../structures/ConvertTime.js";
import { Manager } from "../../../manager.js";
import { Playlist } from "../../../database/schema/Playlist.js";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";
let playlist: Playlist | null;

export default class implements PrefixCommand {
  name = "playlist-import";
  description = "Import a playlist to queue.";
  category = "Playlist";
  usage = "<playlist_name_or_id>";
  aliases = ["pl-import"];
  accessableby = Accessableby.Member;
  lavalink = true;

  async run(
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) {
    const value = args[0] ? args[0] : null;

    if (value == null)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "invalid")}`
            )
            .setColor(client.color),
        ],
      });

    const { channel } = message.member!.voice;
    if (!channel)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "import_voice")}`
            )
            .setColor(client.color),
        ],
      });

    const player = await client.manager.createPlayer({
      guildId: message.guild!.id,
      voiceId: message.member!.voice.channel!.id,
      textId: message.channel.id,
      deaf: true,
    });

    const SongAdd = [];
    let SongLoad = 0;

    if (value) {
      const Plist = value.replace(/_/g, " ");

      const fullList = await client.db.playlist.all();

      const filter_level_1 = fullList.filter(function (data) {
        return (
          data.value.owner == message.author.id && data.value.name == Plist
        );
      });

      playlist = await client.db.playlist.get(`${filter_level_1[0].id}`);
    }

    if (!playlist)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "invalid")}`
            )
            .setColor(client.color),
        ],
      });

    if (playlist.private && playlist.owner !== message.author.id) {
      message.reply({
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

    const msg = await message.reply({
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
        requester: message.author,
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
        const embed = new EmbedBuilder() // **Imported • \`${Plist}\`** (${playlist.tracks.length} tracks) • ${message.author}
          .setDescription(
            `${client.i18n.get(language, "playlist", "import_imported", {
              name: playlist.name,
              tracks: String(playlist.tracks!.length),
              duration: totalDuration,
              user: String(message.author),
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
