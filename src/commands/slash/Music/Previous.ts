import { CommandInteraction, EmbedBuilder, GuildMember } from "discord.js"
import { Manager } from "../../../manager.js"

// Main code
export default {
  name: ["previous"],
  description: "Play the previous song in the queue.",
  category: "Music",
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) => {
    await interaction.deferReply({ ephemeral: false })
    const msg = await interaction.editReply(
      `${client.i18n.get(language, "music", "previous_loading")}`
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
    if (!player.queue.previous)
      return msg.edit(
        `${client.i18n.get(language, "music", "previous_notfound")}`
      )

    await player.queue.unshift(player.queue.previous)
    await player.skip()

    const embed = new EmbedBuilder()
      .setDescription(`${client.i18n.get(language, "music", "previous_msg")}`)
      .setColor(client.color)

    msg.edit({ content: " ", embeds: [embed] })
  },
}
