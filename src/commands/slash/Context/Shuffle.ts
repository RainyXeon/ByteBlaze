import {
  EmbedBuilder,
  ApplicationCommandType,
  ContextMenuCommandInteraction,
  GuildMember,
} from "discord.js";
import { Manager } from "../../../manager.js";

export default {
  name: ["Shuffle"],
  type: ApplicationCommandType.Message,
  category: "Context",
  owner: false,
  premium: false,
  lavalink: true,
  isManager: false,

  /**
   * @param {ContextMenuInteraction} interaction
   */
  run: async (
    interaction: ContextMenuCommandInteraction,
    client: Manager,
    language: string
  ) => {
    await interaction.deferReply({ ephemeral: false });
    const msg = await interaction.editReply(
      `${client.i18n.get(language, "music", "shuffle_loading")}`
    );

    const player = client.manager.players.get(interaction.guild!.id);
    if (!player)
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_player")}`);
    const { channel } = (interaction.member as GuildMember)!.voice;
    if (
      !channel ||
      (interaction.member as GuildMember)!.voice.channel !==
        interaction.guild!.members.me!.voice.channel
    )
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_voice")}`);

    await player.queue.shuffle();

    const shuffle = new EmbedBuilder()
      .setDescription(`${client.i18n.get(language, "music", "shuffle_msg")}`)
      .setColor(client.color);

    msg.edit({ content: " ", embeds: [shuffle] });
  },
};
