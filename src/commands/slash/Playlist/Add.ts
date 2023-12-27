import {
  EmbedBuilder,
  CommandInteraction,
  ApplicationCommandOptionType,
  CommandInteractionOptionResolver,
  AutocompleteInteraction,
} from "discord.js";
import { ConvertTime } from "../../../structures/ConvertTime.js";
import { StartQueueDuration } from "../../../structures/QueueDuration.js";
import { KazagumoTrack } from "kazagumo.mod";
import { Manager } from "../../../manager.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";
import {
  AutocompleteInteractionChoices,
  GlobalInteraction,
} from "../../../@types/Interaction.js";

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
                url: String(tracks[0].uri),
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
                url: String(tracks[0].uri),
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

  // Autocomplete function
  async autocomplete(
    client: Manager,
    interaction: GlobalInteraction,
    language: string
  ) {
    let choice: AutocompleteInteractionChoices[] = [];
    const url = String(
      (interaction as CommandInteraction).options.get("search")!.value
    );

    const Random =
      client.config.lavalink.DEFAULT[
        Math.floor(Math.random() * client.config.lavalink.DEFAULT.length)
      ];

    const match = client.REGEX.some((match) => {
      return match.test(url) == true;
    });

    if (match == true) {
      choice.push({ name: url, value: url });
      await (interaction as AutocompleteInteraction)
        .respond(choice)
        .catch(() => {});
      return;
    }

    if (client.lavalinkUsing.length == 0) {
      choice.push({
        name: `${client.i18n.get(language, "music", "no_node")}`,
        value: `${client.i18n.get(language, "music", "no_node")}`,
      });
      return;
    }
    const searchRes = await client.manager.search(url || Random);

    if (searchRes.tracks.length == 0 || !searchRes.tracks) {
      return choice.push({ name: "Error song not matches", value: url });
    }

    for (let i = 0; i < 10; i++) {
      const x = searchRes.tracks[i];
      choice.push({
        name: x.title ? x.title : "Unknown track name",
        value: x.uri ? x.uri : url,
      });
    }

    await (interaction as AutocompleteInteraction)
      .respond(choice)
      .catch(() => {});
  }
}
