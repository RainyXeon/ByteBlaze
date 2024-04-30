import { RainlinkEvents, RainlinkLoopMode, RainlinkPlayerState } from "../Interface/Constants.js";
import { LavalinkEventsEnum } from "../Interface/LavalinkEvents.js";
import { Rainlink } from "../Rainlink.js";

export class RainlinkPlayerEvents {
  protected readonly methods: Record<string, (manager: Rainlink, data: Record<string, any>) => void>;

  constructor() {
    this.methods = {
      TrackStartEvent: this.TrackStartEvent,
      TrackEndEvent: this.TrackEndEvent,
      TrackExceptionEvent: this.TrackExceptionEvent,
      TrackStuckEvent: this.TrackStuckEvent,
      WebSocketClosedEvent: this.WebSocketClosedEvent,
    };
  }

  public initial(data: Record<string, any>, manager: Rainlink) {
    if (data.op == LavalinkEventsEnum.PlayerUpdate) return this.PlayerUpdate(manager, data);
    const _function = this.methods[data.type];
    if (_function !== undefined) _function(manager, data);
  }

  protected TrackStartEvent(manager: Rainlink, data: Record<string, any>) {
    const player = manager.players.get(data.guildId);
    if (player) {
      player.playing = true;
      player.paused = false;
      manager.emit(RainlinkEvents.TrackStart, player, player.queue.current);
      manager.emit(
        RainlinkEvents.Debug,
        `[Rainlink] / [Player @ ${data.guildId}] / [Events] / [Start] | ` + JSON.stringify(data)
      );
    }
    return;
  }

  protected TrackEndEvent(manager: Rainlink, data: Record<string, any>) {
    const player = manager.players.get(data.guildId);
    if (player) {
      // This event emits STOPPED reason when destroying, so return to prevent double emit
      if (player.state === RainlinkPlayerState.DESTROYED)
        return manager.emit(
          RainlinkEvents.Debug,
          `[Rainlink] / [Player @ ${data.guildId}] / [Events] / [End] | Player ${player.guildId} destroyed from end event`
        );

      manager.emit(
        RainlinkEvents.Debug,
        `[Rainlink] / [Player @ ${data.guildId}] / [Events] / [End] | ` +
          `Tracks: ${player.queue.length} ` +
          JSON.stringify(data)
      );

      player.playing = false;
      player.paused = true;

      if (data.reason === "replaced") {
        return manager.emit(RainlinkEvents.TrackEnd, player, player.queue.current);
      }
      if (["loadFailed", "cleanup"].includes(data.reason)) {
        if (player.queue.current) player.queue.previous.push(player.queue.current);
        if (!player.queue.length && !player.sudoDestroy) return manager.emit(RainlinkEvents.QueueEmpty, player);
        manager.emit(RainlinkEvents.QueueEmpty, player, player.queue.current);
        player.queue.current = null;
        return player.play();
      }

      if (player.loop == RainlinkLoopMode.SONG && player.queue.current) player.queue.unshift(player.queue.current);
      if (player.loop == RainlinkLoopMode.QUEUE && player.queue.current) player.queue.push(player.queue.current);

      if (player.queue.current) player.queue.previous.push(player.queue.current);
      const currentSong = player.queue.current;
      player.queue.current = null;

      if (player.queue.length) {
        manager.emit(RainlinkEvents.TrackEnd, player, currentSong);
      } else if (!player.queue.length && !player.sudoDestroy) {
        return manager.emit(RainlinkEvents.QueueEmpty, player);
      } else return;

      return player.play();
    }
    return;
  }

  protected TrackExceptionEvent(manager: Rainlink, data: Record<string, any>) {
    const player = manager.players.get(data.guildId);
    if (player) {
      manager.emit(RainlinkEvents.PlayerException, player, data);
      manager.emit(
        RainlinkEvents.Debug,
        `[Rainlink] / [Player @ ${data.guildId}] / [Events] / [Exception] | ` + JSON.stringify(data)
      );
    }
    return;
  }

  protected TrackStuckEvent(manager: Rainlink, data: Record<string, any>) {
    const player = manager.players.get(data.guildId);
    if (player) {
      manager.emit(RainlinkEvents.TrackStuck, player, data);
      manager.emit(
        RainlinkEvents.Debug,
        `[Rainlink] / [Player @ ${data.guildId}] / [Events] / [Stuck] | ` + JSON.stringify(data)
      );
    }
    return;
  }

  protected WebSocketClosedEvent(manager: Rainlink, data: Record<string, any>) {
    const player = manager.players.get(data.guildId);
    if (player) {
      manager.emit(RainlinkEvents.PlayerWebsocketClosed, player, data);
      manager.emit(
        RainlinkEvents.Debug,
        `[Rainlink] / [Player @ ${data.guildId}] / [Events] / [WebsocketClosed] | ` + JSON.stringify(data)
      );
    }
    return;
  }

  protected PlayerUpdate(manager: Rainlink, data: Record<string, any>) {
    const player = manager.players.get(data.guildId);
    if (player) {
      player.position = Number(data.state.position);
      manager.emit(
        RainlinkEvents.Debug,
        `[Rainlink] / [Player @ ${data.guildId}] / [Events] / [Updated] | ` + JSON.stringify(data)
      );
      manager.emit(RainlinkEvents.PlayerUpdate, player, data);
    }
    return;
  }
}
