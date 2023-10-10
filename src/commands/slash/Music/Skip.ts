import { EmbedBuilder, CommandInteraction, GuildMember } from "discord.js";
import { Manager } from "../../../manager.js";

// Main code
export default {
  name: ["skip"],
  description: "Skips the song currently playing.",
  category: "Music",
  owner: false,
  premium: false,
  lavalink: true,
  isManager: false,
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) => {
    await interaction.deferReply({ ephemeral: false });
    const msg = await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "skip_loading")}`
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
    const current = player.queue.current;

    if (player.queue.size == 0) {
      await player.destroy();
      await client.UpdateMusic(player);

      const skipped = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "skip_msg")}`)
        .setColor(client.color);

      msg.edit({ content: " ", embeds: [skipped] });
    } else {
      await player.skip();

      const skipped = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "skip_msg")}`)
        .setColor(client.color);

      msg.edit({ content: " ", embeds: [skipped] });
    }
  },
};
