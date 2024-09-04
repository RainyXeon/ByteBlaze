import { RainlinkEvents, RainlinkLoopMode, RainlinkPlayer } from "rainlink";

export class ExtendedPlayer extends RainlinkPlayer {
  public clear(emitEmpty: boolean): void {
    this.loop = RainlinkLoopMode.NONE
    this.queue.clear()
    this.queue.current = undefined
    this.queue.previous.length = 0
    this.volume = this.manager.rainlinkOptions!.options!.defaultVolume ?? 100
    this.paused = true
    this.playing = false
    this.track = null
    if (!this.data.get('sudo-destroy')) this.data.clear()
    this.position = 0
    if (emitEmpty) this.manager.emit(RainlinkEvents.QueueEmpty, this, this.queue)
    return
  }
}