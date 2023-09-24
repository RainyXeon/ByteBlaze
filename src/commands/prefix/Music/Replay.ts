import { Manager } from "../../../manager.js"
import { EmbedBuilder, Message } from "discord.js"

// Main code
export default {
  name: "replay",
  description: "Replay the current song!",
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
      `${client.i18n.get(language, "music", "replay_loading")}`
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

    await player["send"]({
      op: "seek",
      guildId: message.guild!.id,
      position: 0,
    })

    const embed = new EmbedBuilder()
      .setDescription(`${client.i18n.get(language, "music", "replay_msg")}`)
      .setColor(client.color)

    msg.edit({ content: " ", embeds: [embed] })
  },
}
