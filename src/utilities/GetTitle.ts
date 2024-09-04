import { Manager } from '../manager.js'
import { RainlinkTrack } from 'rainlink'

export function getTitle(client: Manager, track: RainlinkTrack) {
  if (client.config.player.AVOID_SUSPEND) return track.title
  return `[${track.title}](${track.uri})`
}
