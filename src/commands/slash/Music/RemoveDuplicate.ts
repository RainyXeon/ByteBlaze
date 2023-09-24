import { EmbedBuilder, CommandInteraction, GuildMember } from "discord.js"
import { convertTime } from "../../../structures/ConvertTime.js"
import { Manager } from "../../../manager.js"
import { KazagumoTrack } from "kazagumo"

let OriginalQueueLength: null | number

// Main code
export default {
  name: ["remove-duplicate"],
  description: "Remove duplicated song from queue",
  category: "Music",
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) => {
    const msg = await interaction.deferReply({ ephemeral: false })

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

    OriginalQueueLength = player.queue.length

    for (let i = 0; i < player.queue.length; i++) {
      const element = player.queue[i]
      if (player.queue.current!.uri == element.uri) {
        player.queue.splice(
          player.queue.indexOf(player.queue.current as KazagumoTrack),
          1
        )
      }
    }

    const unique = [...new Map(player.queue.map((m) => [m.uri, m])).values()]

    player.queue.clear()
    player.queue.push(...unique)

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "music", "removetrack_duplicate_desc", {
          original: String(OriginalQueueLength),
          new: String(unique.length),
          removed: String(OriginalQueueLength - unique.length),
        })}`
      )
      .setColor(client.color)

    await interaction.editReply({ embeds: [embed] })

    OriginalQueueLength = null
    return
  },
}
