import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
} from "discord.js";
import { FormatDuration } from "../../../structures/FormatDuration.js";
import { Manager } from "../../../manager.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";
const fastForwardNum = 10;

// Main code
export default class implements SlashCommand {
  name = ["forward"];
  description = "Forward timestamp in the song!";
  category = "Music";
  accessableby = Accessableby.Member;
  lavalink = true;
  options = [
    {
      name: "seconds",
      description: "The number of seconds to forward the timestamp by.",
      type: ApplicationCommandOptionType.Number,
      required: false,
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
    ).getNumber("seconds");
    const msg = await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "forward_loading")}`
          )
          .setColor(client.color),
      ],
    });

    const player = client.manager.players.get(interaction.guild!.id);
    if (!player)
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_player")}`
            )
            .setColor(client.color),
        ],
      });
    const { channel } = (interaction.member as GuildMember)!.voice;
    if (
      !channel ||
      (interaction.member as GuildMember)!.voice.channel !==
        interaction.guild!.members.me!.voice.channel
    )
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_voice")}`
            )
            .setColor(client.color),
        ],
      });

    const song = player.queue.current;
    const song_position = player.shoukaku.position;
    const CurrentDuration = new FormatDuration().parse(song_position);

    if (value && !isNaN(value)) {
      if (song_position + value * 1000 < song!.length!) {
        player.send({
          guildId: String(interaction.guild?.id),
          playerOptions: {
            position: song_position + value * 1000,
          },
        });

        const forward1 = new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "forward_msg", {
              duration: CurrentDuration,
            })}`
          )
          .setColor(client.color);

        msg.edit({ content: " ", embeds: [forward1] });
      } else {
        return msg.edit(
          `${client.i18n.get(language, "music", "forward_beyond")}`
        );
      }
    } else if (value && isNaN(value)) {
      return msg.edit(
        `${client.i18n.get(language, "music", "forward_invalid", {
          prefix: "/",
        })}`
      );
    }

    if (!value) {
      if (song_position + fastForwardNum * 1000 < song!.length!) {
        player.send({
          guildId: String(interaction.guild?.id),
          playerOptions: {
            position: song_position + fastForwardNum * 1000,
          },
        });

        const forward2 = new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "forward_msg", {
              duration: CurrentDuration,
            })}`
          )
          .setColor(client.color);

        msg.edit({ content: " ", embeds: [forward2] });
      } else {
        return msg.edit(
          `${client.i18n.get(language, "music", "forward_beyond")}`
        );
      }
    }
  }
}
