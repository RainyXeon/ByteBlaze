import { ButtonStyle, Message } from 'discord.js'
import { Manager } from '../../../manager.js'

import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  version,
} from 'discord.js'
import ms from 'pretty-ms'

export default {
  name: 'status',
  description: 'Shows the status information of the Bot',
  category: 'Info',
  usage: '',
  aliases: [],
  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) => {
    const info = new EmbedBuilder()
      .setTitle(client.user!.tag + ' Status')
      .addFields([
        {
          name: 'Uptime',
          value: `\`\`\`${ms(client.uptime as number)}\`\`\``,
          inline: true,
        },
        {
          name: 'WebSocket Ping',
          value: `\`\`\`${client.ws.ping}ms\`\`\``,
          inline: true,
        },
        {
          name: 'Memory',
          value: `\`\`\`${(process.memoryUsage().rss / 1024 / 1024).toFixed(
            2
          )} MB RSS\n${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
            2
          )} MB Heap\`\`\``,
          inline: true,
        },
        {
          name: 'Guild Count',
          value: `\`\`\`${client.guilds.cache.size} guilds\`\`\``,
          inline: true,
        },
        {
          name: 'User Count',
          value: `\`\`\`${client.guilds.cache.reduce(
            (a, b) => a + b.memberCount,
            0
          )} users\`\`\``,
          inline: true,
        },
        {
          name: 'Node',
          value: `\`\`\`${process.version} on ${process.platform} ${process.arch}\`\`\``,
          inline: true,
        },
        {
          name: 'Cached Data',
          value: `\`\`\`${client.guilds.cache.reduce(
            (a, b) => a + b.memberCount,
            0
          )} users\n${client.emojis.cache.size} emojis\`\`\``,
          inline: true,
        },
        { name: 'Discord.js', value: `\`\`\`${version}\`\`\``, inline: true },
      ])
      .setTimestamp()
      .setColor(client.color)

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel('Invite Me')
        .setStyle(ButtonStyle.Link)
        .setURL(
          `https://discord.com/api/oauth2/authorize?client_id=${
            client.user!.id
          }&permissions=8&scope=bot%20applications.commands`
        )
    )
    await message.reply({ embeds: [info], components: [row] })
  },
}
