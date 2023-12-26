import { EmbedBuilder, CommandInteraction, GuildMember } from "discord.js";
import { Manager } from "../../../manager.js";
import {
  Accessableby,
  CommandOptionInterface,
  SlashCommand,
} from "../../../@types/Command.js";

export default class implements SlashCommand {
  name = ["pause"];
  description = "Pause the music!";
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
            `${client.i18n.get(language, "music", "pause_loading")}`
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

    await player.pause(true);
    const uni = player.paused
      ? `${client.i18n.get(language, "music", "pause_switch_pause")}`
      : `${client.i18n.get(language, "music", "pause_switch_resume")}`;

    client.emit("playerPause", player);

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "music", "pause_msg", {
          pause: uni,
        })}`
      )
      .setColor(client.color);

    msg.edit({ content: " ", embeds: [embed] });
  }
}
