import { ContextMenuCommandInteraction, GuildMember } from "discord.js";
import { EmbedBuilder, ApplicationCommandType } from "discord.js";
import { Manager } from "../../../manager.js";
import { KazagumoLoopMode } from "../../../@types/Lavalink.js";

export default {
  name: ["Loop"],
  type: ApplicationCommandType.Message,
  category: "Context",
  owner: false,
  premium: false,
  lavalink: true,
  isManager: false,

  run: async (
    interaction: ContextMenuCommandInteraction,
    client: Manager,
    language: string
  ) => {
    await interaction.deferReply({ ephemeral: false });
    const msg = await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "leave_loading")}`
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

    const loop_mode = {
      none: "none",
      track: "track",
      queue: "queue",
    };

    if (player.loop === "none") {
      await player.setLoop(loop_mode.queue as KazagumoLoopMode);
      const looped_queue = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "loop_all")}`)
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [looped_queue] });
    } else if (player.loop === "queue") {
      await player.setLoop(loop_mode.none as KazagumoLoopMode);
      const looped = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "unloop_all")}`)
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [looped] });
    }
  },
};
