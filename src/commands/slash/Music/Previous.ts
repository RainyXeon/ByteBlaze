import { CommandInteraction, EmbedBuilder, GuildMember } from "discord.js";
import { Manager } from "../../../manager.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";

// Main code
export default class implements SlashCommand {
  name = ["previous"];
  description = "Play the previous song in the queue.";
  category = "Music";
  lavalink = true;
  options = [];
  accessableby = Accessableby.Member;
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
            `${client.i18n.get(language, "music", "previous_loading")}`
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
    if (player.queue.previous.length == 0)
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "previous_notfound")}`
            )
            .setColor(client.color),
        ],
      });

    await player.queue.unshift(player.queue.previous[0]);
    await player.skip();

    const embed = new EmbedBuilder()
      .setDescription(`${client.i18n.get(language, "music", "previous_msg")}`)
      .setColor(client.color);

    msg.edit({ content: " ", embeds: [embed] });
  }
}
