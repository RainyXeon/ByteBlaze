import {
  EmbedBuilder,
  PermissionsBitField,
  ApplicationCommandOptionType,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
  Message,
  AutocompleteInteraction,
} from "discord.js";
import { ConvertTime } from "../../../structures/ConvertTime.js";
import { StartQueueDuration } from "../../../structures/QueueDuration.js";
import { Manager } from "../../../manager.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";
import { AutocompleteInteractionChoices, GlobalInteraction } from "../../../@types/Interaction.js";

export default class implements SlashCommand {
  name = ["play"];
  description = "Play a song from any types";
  category = "Music";
  accessableby = Accessableby.Member;
  lavalink = true;

  options = [
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
        let player = client.manager.players.get(interaction.guild!.id);
        const value = (
          interaction.options as CommandInteractionOptionResolver
        ).get("search")!.value;
        const msg = await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "music", "play_loading", {
                  result: String(
                    (
                      interaction.options as CommandInteractionOptionResolver
                    ).get("search")!.value
                  ),
                })}`
              )
              .setColor(client.color),
          ],
        });

        const { channel } = (interaction.member as GuildMember)!.voice;
        if (!channel)
          return msg.edit({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `${client.i18n.get(language, "noplayer", "no_voice")}`
                )
                .setColor(client.color),
            ],
          });

        if (!player) {
          player = await client.manager.createPlayer({
            guildId: interaction.guild!.id,
            voiceId: (interaction.member as GuildMember).voice.channel!.id,
            textId: interaction.channel!.id,
            deaf: true,
          });
        } else if (
          player &&
          !this.checkSameVoice(interaction)
        ) {
          msg.edit({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `${client.i18n.get(language, "noplayer", "no_voice")}`
                )
                .setColor(client.color),
            ],
          });
          return;
        }

        if (!(value as string))
          return msg.edit({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `${client.i18n.get(language, "music", "play_match")}`
                )
                .setColor(client.color),
            ],
          });

        const result = await player.search(value as string, {
          requester: interaction.user,
        });
        const tracks = result.tracks;

        if (!result.tracks.length)
          return msg.edit({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `${client.i18n.get(language, "music", "play_match")}`
                )
                .setColor(client.color),
            ],
          });
        if (result.type === "PLAYLIST")
          for (let track of tracks) player.queue.add(track);
        else if (player.playing && result.type === "SEARCH")
          player.queue.add(tracks[0]);
        else if (player.playing && result.type !== "SEARCH")
          for (let track of tracks) player.queue.add(track);
        else player.play(tracks[0]);

        const TotalDuration = new StartQueueDuration().parse(tracks);

        if (result.type === "TRACK") {
          const embed = new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "play_track", {
                title: tracks[0].title,
                url: tracks[0].uri,
                duration: new ConvertTime().parse(tracks[0].length as number),
                request: String(tracks[0].requester),
              })}`
            )
            .setColor(client.color);
          msg.edit({ content: " ", embeds: [embed] });
        } else if (result.type === "PLAYLIST") {
          const embed = new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "play_playlist", {
                title: tracks[0].title,
                url: String(value),
                duration: new ConvertTime().parse(TotalDuration),
                songs: String(tracks.length),
                request: String(tracks[0].requester),
              })}`
            )
            .setColor(client.color);
          msg.edit({ content: " ", embeds: [embed] });
          if (!player.playing) player.play();
        } else if (result.type === "SEARCH") {
          const embed = new EmbedBuilder()
            .setColor(client.color)
            .setDescription(
              `${client.i18n.get(language, "music", "play_result", {
                title: tracks[0].title,
                url: tracks[0].uri,
                duration: new ConvertTime().parse(tracks[0].length as number),
                request: String(tracks[0].requester),
              })}`
            );
          msg.edit({ content: " ", embeds: [embed] });
        }
      }
    } catch (e) {}
  }

  private checkSameVoice(
    interaction: CommandInteraction,
  ) {
      return (interaction.member as GuildMember)!.voice.channel !==
      interaction.guild!.members.me!.voice.channel
    )
  }

  // Autocomplete function
  async autocomplete(
    client: Manager,
    interaction: GlobalInteraction,
    language: string,
  ) {
    let choice: AutocompleteInteractionChoices[] = [];
    const url = String((interaction as CommandInteraction).options.get(
      "search"
    )!.value);

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

    if (client.lavalink_using.length == 0) {
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
