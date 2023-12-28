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
  description = "Forward timestamp in the song! (10s)";
  category = "Music";
  accessableby = Accessableby.Member;
  lavalink = true;
  options = [];
  async run(
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) {
    await interaction.deferReply({ ephemeral: false });
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
    const CurrentDuration = new FormatDuration().parse(
      song_position + fastForwardNum * 1000
    );

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
