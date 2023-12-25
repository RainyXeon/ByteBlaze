import {
  EmbedBuilder,
  ApplicationCommandType,
  ContextMenuCommandInteraction,
  GuildMember,
} from "discord.js";
import { Manager } from "../../manager.js";
import { Accessableby, ContextCommand } from "../../@types/Command.js";

export default class implements ContextCommand {
  name = ["Shuffle"];
  type = ApplicationCommandType.Message;
  category = "Context";
  accessableby = Accessableby.Member;
  lavalink = true;

  /**
   * @param {ContextMenuInteraction} interaction
   */
  async run(
    interaction: ContextMenuCommandInteraction,
    client: Manager,
    language: string
  ) {
    await interaction.deferReply({ ephemeral: false });
    const msg = await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "shuffle_loading")}`
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

    await player.queue.shuffle();

    const shuffle = new EmbedBuilder()
      .setDescription(`${client.i18n.get(language, "music", "shuffle_msg")}`)
      .setColor(client.color);

    msg.edit({ content: " ", embeds: [shuffle] });
  }
}
