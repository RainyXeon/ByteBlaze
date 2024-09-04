import { EmbedBuilder } from 'discord.js'
import { formatDuration } from '../../utilities/FormatDuration.js'
import { Manager } from '../../manager.js'
import { Accessableby, Command } from '../../structures/Command.js'
import { CommandHandler } from '../../structures/CommandHandler.js'
import { RainlinkPlayer } from 'rainlink'
const rewindNum = 10

// Main code
export default class implements Command {
  public name = ['rewind']
  public description = 'Rewind timestamp in the song! (10s)'
  public category = 'Music'
  public accessableby = [Accessableby.Member]
  public usage = ''
  public aliases = []
  public lavalink = true
  public playerCheck = true
  public usingInteraction = true
  public sameVoiceCheck = true
  public permissions = []
  public options = []

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply()

    const player = client.rainlink.players.get(handler.guild!.id) as RainlinkPlayer

    const song_position = player.position
    const CurrentDuration = formatDuration(song_position - rewindNum * 1000)

    if (song_position - rewindNum * 1000 > 0) {
      await player.send({
        guildId: handler.guild!.id,
        playerOptions: {
          position: song_position - rewindNum * 1000,
        },
      })

      const rewind2 = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(handler.language, 'command.music', 'rewind_msg', {
            duration: CurrentDuration,
          })}`
        )
        .setColor(client.color)

      handler.editReply({ content: ' ', embeds: [rewind2] })
    } else {
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(handler.language, 'command.music', 'rewind_beyond')}`
            )
            .setColor(client.color),
        ],
      })
    }
  }
}
