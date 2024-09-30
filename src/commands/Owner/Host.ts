import { EmbedBuilder } from 'discord.js'
import { Manager } from '../../manager.js'
import { Accessableby, Command } from '../../structures/Command.js'
import { CommandHandler } from '../../structures/CommandHandler.js'
import os from 'os'
import ms from 'pretty-ms'
import { stripIndents } from 'common-tags'

export default class implements Command {
  public name = ['host']
  public description = 'Show the host infomation/status!'
  public category = 'Owner'
  public accessableby = [Accessableby.Owner]
  public usage = ''
  public aliases = []
  public lavalink = false
  public usingInteraction = true
  public playerCheck = false
  public sameVoiceCheck = false
  public permissions = []
  public options = []

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply()

    const total = os.totalmem() / 1024 / 1024
    const used = process.memoryUsage().rss / 1024 / 1024
    const heapUsed = process.memoryUsage().heapUsed / 1024 / 1024
    const heapTotal = process.memoryUsage().heapUsed / 1024 / 1024

    const hostInfo = stripIndents`\`\`\`
    - OS: ${os.type()} ${os.release()} (${os.arch()})
    - CPU: ${os.cpus()[0].model}
    - Uptime: ${ms(client.uptime as number)}
    - RAM: ${(total / 1024).toFixed(2)} GB
    - Memory Usage: ${used.toFixed(2)}/${total.toFixed(2)} (MB)
    - ├── RSS: ${used.toFixed(2)} MB
    - ├── Used Heap: ${heapUsed.toFixed(2)} MB
    - ├── Total Heap: ${heapTotal.toFixed(2)} MB
    - ├── Heap Usage: ${((heapUsed / heapTotal) * 100).toFixed(2)}%
    - └── External: ${(process.memoryUsage().external / 1024 / 1024).toFixed(2)} MB
    - Node.js: ${process.version}
    \`\`\``

    const botInfo = stripIndents`\`\`\`
    - Codename: ${client.manifest.metadata.bot.codename}
    - Bot Version: ${client.manifest.metadata.bot.version}
    - Node.js: ${process.version}
    - Discord.js: ${client.manifest.package.discordjs}
    - Rainlink: ${client.manifest.package.rainlink}
    - Autofix Version: ${client.manifest.metadata.autofix.version}
    - Autofix Codename: ${client.manifest.metadata.autofix.codename}
    - Guild Count: ${client.guilds.cache.size}
    - User Count: ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)}
    - Total Packages: ${client.manifest.package.totalAmount}
    \`\`\``

    const embed = new EmbedBuilder()
      .setAuthor({
        name: client.user!.tag + ' Host Status',
        iconURL: String(client.user!.displayAvatarURL({ size: 2048 })),
      })
      .setColor(client.color)
      .addFields({ name: 'Host info', value: hostInfo }, { name: 'Bot info', value: botInfo })
      .setTimestamp()

    handler.editReply({ embeds: [embed] })
  }
}
