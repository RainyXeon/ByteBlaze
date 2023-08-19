import { EmbedBuilder, CommandInteraction, GuildMember } from "discord.js";
import { Manager } from "../../../manager.js";

export default {
  name: ["pause"],
  description: "Pause the music!",
  category: "Music",
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string,
  ) => {
    await interaction.deferReply({ ephemeral: false });
    const msg = await interaction.editReply(
      `${client.i18n.get(language, "music", "pause_loading")}`,
    );

    const player = client.manager.players.get(interaction.guild!.id);
    if (!player)
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_player")}`);
    const { channel } = (interaction.member as GuildMember).voice;
    if (
      !channel ||
      (interaction.member as GuildMember).voice.channel !==
        interaction.guild!.members.me!.voice.channel
    )
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_voice")}`);

    await player.pause(true);
    const uni = player.paused
      ? `${client.i18n.get(language, "music", "pause_switch_pause")}`
      : `${client.i18n.get(language, "music", "pause_switch_resume")}`;
    if (client.websocket)
      await client.websocket.send(
        JSON.stringify({
          op: player.paused ? 3 : 4,
          guild: interaction.guild!.id,
        }),
      );

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "music", "pause_msg", {
          pause: uni,
        })}`,
      )
      .setColor(client.color);

    msg.edit({ content: " ", embeds: [embed] });
  },
};
