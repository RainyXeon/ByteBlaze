/**
 * Represents the payload from a serverUpdate event
 */
export interface ServerUpdate {
  token: string
  guild_id: string
  endpoint: string
}

/**
 * Represents the partial payload from a stateUpdate event
 */
export interface StateUpdatePartial {
  channel_id?: string
  session_id?: string
  self_deaf: boolean
  self_mute: boolean
}
