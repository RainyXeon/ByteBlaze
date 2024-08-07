/**
 * Lavalink events enum
 */
export enum LavalinkEventsEnum {
  Ready = 'ready',
  Status = 'stats',
  Event = 'event',
  PlayerUpdate = 'playerUpdate',
}

/**
 * Lavalink player events enum
 */
export enum LavalinkPlayerEventsEnum {
  TrackStartEvent = 'TrackStartEvent',
  TrackEndEvent = 'TrackEndEvent',
  TrackExceptionEvent = 'TrackExceptionEvent',
  TrackStuckEvent = 'TrackStuckEvent',
  WebSocketClosedEvent = 'WebSocketClosedEvent',
}

/**
 * Reason why track end
 */
export type TrackEndReason = 'finished' | 'loadFailed' | 'stopped' | 'replaced' | 'cleanup'

/**
 * Exception interface
 */
export interface Exception {
  message: string
  severity: Severity
  cause: string
}

/**
 * Exception severity interface
 */
export type Severity = 'common' | 'suspicious' | 'fault'
