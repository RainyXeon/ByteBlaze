import { Manager } from '../../manager.js'

export default async (client: Manager, name: string) => {
  if (client.used_lavalink.length != 0 && client.used_lavalink[0].name == name)
    return
  client.fixing_nodes = false

  client.manager.shoukaku.nodes.forEach((data, index) => {
    const reqUrl = new URL(data['url'], data['url'])
    client.lavalink_using.push({
      host: reqUrl.hostname,
      port: Number(reqUrl.port) | 0,
      pass: data['auth'],
      secure: reqUrl.protocol == 'ws://' ? false : true,
      name: index,
    })
  })

  client.logger.lavalink(`Lavalink [${name}] connected.`)

  client.logger.lavalink(`Setting up data for lavalink...`)
  client.logger.lavalink(`Auto ReConnect Collecting player 24/7 data`)
  const maindata = await client.db.get(`autoreconnect`)
  if (!maindata) {
    client.logger.lavalink(`Auto ReConnect found in 0 servers!`)
    client.logger.lavalink(`Setting up data for lavalink complete!`)
    return
  }

  client.logger.lavalink(
    `Auto ReConnect found in ${Object.keys(maindata).length} servers!`
  )
  if (Object.keys(maindata).length === 0) return

  Object.keys(maindata).forEach(async function (key, index) {
    const data = maindata[key]

    setTimeout(async () => {
      const channel = client.channels.cache.get(data.text)
      const voice = client.channels.cache.get(data.voice)
      if (!channel || !voice) return client.db.delete(`autoreconnect.${key}`)
      await client.manager.createPlayer({
        guildId: data.guild,
        voiceId: data.voice,
        textId: data.text,
        deaf: true,
      })
    }),
      index * 5000
  })

  client.logger.lavalink(`Setting up data for lavalink complete!`)
}
