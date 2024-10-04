import { Manager } from '../manager.js'
import { RainlinkTrack } from 'rainlink'

export function getTitle(client: Manager, track: RainlinkTrack) {
  if (client.config.player.AVOID_SUSPEND) return track && track.title ? track.title : 'Unknown'
  return track && track.title ? `[${track.title}](${track.uri})` : `[Unknown](https://what.com)`
}
