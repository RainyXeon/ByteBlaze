import { Manager } from '../../manager.js'

export default async (
  client: Manager,
  name: string,
  code: number,
  reason: string
) => {
  if (client.used_lavalink.length != 0 && client.used_lavalink[0].name == name)
    return
  client.logger.debug(
    `Lavalink ${name}: Closed, Code ${code}, Reason ${reason || 'No reason'}`
  )
  if (client.config.features.AUTOFIX_LAVALINK && !client.fixing_nodes) {
    client.fixing_nodes = true
    ;(await import('../../lava_scrap/autofix_lavalink.js')).default(client)
  }
}
