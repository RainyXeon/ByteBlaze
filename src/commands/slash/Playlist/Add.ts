import {
  EmbedBuilder,
  CommandInteraction,
  ApplicationCommandOptionType,
  CommandInteractionOptionResolver,
} from "discord.js";
import { ConvertTime } from "../../../structures/ConvertTime.js";
import { StartQueueDuration } from "../../../structures/QueueDuration.js";
import { KazagumoTrack } from "better-kazagumo";
import { Manager } from "../../../manager.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";

const TrackAdd: KazagumoTrack[] = [];

export default class implements SlashCommand {
  name = ["playlist", "add"];
  description = "Add song to a playlist";
  category = "Playlist";
  accessableby = Accessableby.Member;
  lavalink = true;
  options = [
    {
      name: "id",
      description: "The id of the playlist",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "search",
      description: "The song link or name",
      type: ApplicationCommandOptionType.String,
      required: true,
      autocomplete: true,
    },
  ];

  async run(
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) {
    try {
      if (
        (interaction.options as CommandInteractionOptionResolver).getString(
          "search"
        )
      ) {
        await interaction.deferReply({ ephemeral: false });
        const value = (
          interaction.options as CommandInteractionOptionResolver
        ).getString("id");
        const input = (
          interaction.options as CommandInteractionOptionResolver
        ).getString("search");

        const Inputed = input;

        const msg = await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "playlist", "add_loading")}`
              )
              .setColor(client.color),
          ],
        });
        const result = await client.manager.search(input as string, {
          requester: interaction.user,
        });
        const tracks = result.tracks;

        if (!result.tracks.length)
          return msg.edit({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `${client.i18n.get(language, "playlist", "add_match")}`
                )
                .setColor(client.color),
            ],
          });
        if (result.type === "PLAYLIST")
          for (let track of tracks) TrackAdd.push(track);
        else TrackAdd.push(tracks[0]);

        const Duration = new ConvertTime().parse(tracks[0].length as number);
        const TotalDuration = new StartQueueDuration().parse(tracks);

        if (result.type === "PLAYLIST") {
          const embed = new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "add_playlist", {
                title: tracks[0].title,
                url: String(Inputed),
                duration: new ConvertTime().parse(TotalDuration),
                track: String(tracks.length),
                user: String(interaction.user),
              })}`
            )
            .setColor(client.color);
          msg.edit({ content: " ", embeds: [embed] });
        } else if (result.type === "TRACK") {
          const embed = new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "add_track", {
                title: tracks[0].title,
                url: tracks[0].uri,
                duration: Duration,
                user: String(interaction.user),
              })}`
            )
            .setColor(client.color);
          msg.edit({ content: " ", embeds: [embed] });
        } else if (result.type === "SEARCH") {
          const embed = new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "add_search", {
                title: tracks[0].title,
                url: tracks[0].uri,
                duration: Duration,
                user: String(interaction.user),
              })}`
            )
            .setColor(client.color);
          msg.edit({ content: " ", embeds: [embed] });
        } else {
          //The playlist link is invalid.
          return msg.edit({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `${client.i18n.get(language, "playlist", "add_match")}`
                )
                .setColor(client.color),
            ],
          });
        }

        const playlist = await client.db.playlist.get(value!);

        if (!playlist) {
          interaction.followUp({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `${client.i18n.get(language, "playlist", "public_notfound")}`
                )
                .setColor(client.color),
            ],
          });
          TrackAdd.length = 0;
          return;
        }
        if (playlist.owner !== interaction.user.id) {
          interaction.followUp({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `${client.i18n.get(language, "playlist", "add_owner")}`
                )
                .setColor(client.color),
            ],
          });
          TrackAdd.length = 0;
          return;
        }

        const LimitTrack = playlist.tracks!.length + TrackAdd.length;
        if (LimitTrack > client.config.bot.LIMIT_TRACK) {
          interaction.followUp({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `${client.i18n.get(language, "playlist", "add_limit_track", {
                    limit: String(client.config.bot.LIMIT_TRACK),
                  })}`
                )
                .setColor(client.color),
            ],
          });
          TrackAdd.length = 0;
          return;
        }

        TrackAdd.forEach(async (track) => {
          await client.db.playlist.push(`${value}.tracks`, {
            title: track.title,
            uri: track.uri,
            length: track.length,
            thumbnail: track.thumbnail,
            author: track.author,
            requester: track.requester, // Just case can push
          });
        });

        const embed = new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "playlist", "add_added", {
              count: String(TrackAdd.length),
              playlist: value!,
            })}`
          )
          .setColor(client.color);
        interaction.followUp({ content: " ", embeds: [embed] });
        TrackAdd.length = 0;
      }
    } catch (e) {}
  }
}
