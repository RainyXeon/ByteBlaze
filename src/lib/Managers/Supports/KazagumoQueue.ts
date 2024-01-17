/**
 * All the code below is from kazagumo.mod
 * An edited version is retrieved from
 * https://github.com/Takiyo0/Kazagumo/tree/d118eaf22559bd3f2159e2e147a67876d3986669
 * Original developer: Takiyo0 (Github)
 * Mod developer: RainyXeon (Github)
 * Special thanks to Takiyo0 (Github)
 */

import { KazagumoTrack } from "./KazagumoTrack.js";
import { Events, KazagumoError } from "../../Modules/Interfaces.js";
import { KazagumoPlayer } from "../KazagumoPlayer.js";

export class KazagumoQueue extends Array<KazagumoTrack> {
  constructor(private readonly kazagumoPlayer: KazagumoPlayer) {
    super();
  }
  /** Get the size of queue */
  public get size() {
    return this.length;
  }

  /** Get the size of queue including current */
  public get totalSize(): number {
    return this.length + (this.current ? 1 : 0);
  }

  /** Check if the queue is empty or not */
  public get isEmpty() {
    return this.length === 0;
  }

  /** Get the queue's duration */
  public get durationLength() {
    return this.reduce((acc, cur) => acc + (cur.length || 0), 0);
  }

  /** Current playing track */
  public current: KazagumoTrack | undefined | null = null;
  /** Previous playing tracks */
  public previous: KazagumoTrack[] = [];

  /**
   * Add track(s) to the queue
   * @param track KazagumoTrack to add
   * @returns KazagumoQueue
   */
  public add(track: KazagumoTrack | KazagumoTrack[]): KazagumoQueue {
    if (
      Array.isArray(track) &&
      track.some((t) => !(t instanceof KazagumoTrack))
    )
      throw new KazagumoError(1, "Track must be an instance of KazagumoTrack");
    if (!Array.isArray(track) && !(track instanceof KazagumoTrack))
      track = [track];

    if (!this.current) {
      if (Array.isArray(track)) this.current = track.shift();
      else {
        this.current = track;
        return this;
      }
    }

    if (Array.isArray(track)) for (const t of track) this.push(t);
    else this.push(track);
    this.emitChanges();
    return this;
  }

  /**
   * Remove track from the queue
   * @param position Position of the track
   * @returns KazagumoQueue
   */
  public remove(position: number): KazagumoQueue {
    if (position < 0 || position >= this.length)
      throw new KazagumoError(
        1,
        "Position must be between 0 and " + (this.length - 1)
      );
    this.splice(position, 1);
    this.emitChanges();
    return this;
  }

  /** Shuffle the queue */
  public shuffle(): KazagumoQueue {
    for (let i = this.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this[i], this[j]] = [this[j], this[i]];
    }
    this.emitChanges();
    return this;
  }

  /** Clear the queue */
  public clear(): KazagumoQueue {
    this.splice(0, this.length);
    this.emitChanges();
    return this;
  }

  private emitChanges(): void {
    this.kazagumoPlayer.shoukaku.emit(
      Events.QueueUpdate,
      this.kazagumoPlayer,
      this
    );
  }
}
