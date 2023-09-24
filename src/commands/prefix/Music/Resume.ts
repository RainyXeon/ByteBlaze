import { Manager } from "../../../manager.js"
import { EmbedBuilder, Message } from "discord.js"

// Main code
export default {
  name: "resume",
  description: "Resume the music!",
  category: "Music",
  usage: "",
  aliases: [],

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) => {
    const msg = await message.channel.send(
      `${client.i18n.get(language, "music", "resume_loading")}`
    )

    const player = client.manager.players.get(message.guild!.id)
    if (!player)
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_player")}`)
    const { channel } = message.member!.voice
    if (
      !channel ||
      message.member!.voice.channel !== message.guild!.members.me!.voice.channel
    )
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_voice")}`)

    await player.pause(false)
    const uni = player.paused
      ? `${client.i18n.get(language, "music", "resume_switch_pause")}`
      : `${client.i18n.get(language, "music", "resume_switch_resume")}`

    if (client.websocket)
      await client.websocket.send(
        JSON.stringify({
          op: player.paused ? 3 : 4,
          guild: message.guild!.id,
        })
      )

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "music", "resume_msg", {
          resume: uni,
        })}`
      )
      .setColor(client.color)

    msg.edit({ content: " ", embeds: [embed] })
  },
}
