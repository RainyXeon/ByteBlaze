import { EmbedBuilder, CommandInteraction, GuildMember } from "discord.js"
import { Manager } from "../../../manager.js"

// Main code
export default {
  name: ["loopall"],
  description: "Loop all songs in queue!",
  category: "Music",
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) => {
    await interaction.deferReply({ ephemeral: false })
    const msg = await interaction.editReply(
      `${client.i18n.get(language, "music", "loopall_loading")}`
    )
    const player = client.manager.players.get(interaction.guild!.id)
    if (!player)
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_player")}`)
    const { channel } = (interaction.member as GuildMember).voice
    if (
      !channel ||
      (interaction.member as GuildMember).voice.channel !==
        interaction.guild!.members.me!.voice.channel
    )
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_voice")}`)

    if (player.loop === "queue") {
      await player.setLoop("none")

      const unloopall = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "unloopall")}`)
        .setColor(client.color)

      return msg.edit({ content: " ", embeds: [unloopall] })
    } else if (player.loop === "none") {
      await player.setLoop("queue")

      const loopall = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "loopall")}`)
        .setColor(client.color)

      return msg.edit({ content: " ", embeds: [loopall] })
    }
  },
}
