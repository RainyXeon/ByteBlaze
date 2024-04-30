import util from "node:util";
import { RainlinkEvents, RainlinkFilterData, RainlinkFilterMode, RainlinkPlayerState } from "../Interface/Constants.js";
import {
  Band,
  ChannelMix,
  Distortion,
  FilterOptions,
  Freq,
  Karaoke,
  LowPass,
  Rotation,
  Timescale,
} from "../Interface/Player.js";
import { RainlinkPlayer } from "./RainlinkPlayer.js";

export class RainlinkFilter {
  constructor(protected player: RainlinkPlayer) {}

  /**
   * Set a filter that prebuilt in rainlink
   * @param filter The filter name
   * @returns RainlinkPlayer
   */
  public async set(filter: RainlinkFilterMode): Promise<RainlinkPlayer> {
    this.checkDestroyed();

    const filterData = RainlinkFilterData[filter];

    if (!filterData) {
      this.debug(`Filter ${filter} not avaliable in Rainlink's filter prebuilt`);
      return this.player;
    }

    await this.player.send({
      guildId: this.player.guildId,
      playerOptions: {
        filters: filterData,
      },
    });

    this.debug(
      filter !== "clear"
        ? `${filter} filter has been successfully set.`
        : "All filters have been successfully reset to their default positions."
    );

    return this.player;
  }

  /**
   * Clear all the filter
   * @returns RainlinkPlayer
   */
  public async clear(): Promise<RainlinkPlayer> {
    this.checkDestroyed();

    await this.player.send({
      guildId: this.player.guildId,
      playerOptions: {
        filters: {},
      },
    });

    this.debug("All filters have been successfully reset to their default positions.");

    return this.player;
  }

  /**
   * Sets the filter volume of the player
   * @param volume Target volume 0.0-5.0
   */
  public async setVolume(volume: number): Promise<RainlinkPlayer> {
    return this.setRaw({ volume });
  }

  /**
   * Change the equalizer settings applied to the currently playing track
   * @param equalizer An array of objects that conforms to the Bands type that define volumes at different frequencies
   */
  public setEqualizer(equalizer: Band[]): Promise<RainlinkPlayer> {
    return this.setRaw({ equalizer });
  }

  /**
   * Change the karaoke settings applied to the currently playing track
   * @param karaoke An object that conforms to the KaraokeSettings type that defines a range of frequencies to mute
   */
  public setKaraoke(karaoke?: Karaoke): Promise<RainlinkPlayer> {
    return this.setRaw({ karaoke: karaoke || null });
  }

  /**
   * Change the timescale settings applied to the currently playing track
   * @param timescale An object that conforms to the TimescaleSettings type that defines the time signature to play the audio at
   */
  public setTimescale(timescale?: Timescale): Promise<RainlinkPlayer> {
    return this.setRaw({ timescale: timescale || null });
  }

  /**
   * Change the tremolo settings applied to the currently playing track
   * @param tremolo An object that conforms to the FreqSettings type that defines an oscillation in volume
   */
  public setTremolo(tremolo?: Freq): Promise<RainlinkPlayer> {
    return this.setRaw({ tremolo: tremolo || null });
  }

  /**
   * Change the vibrato settings applied to the currently playing track
   * @param vibrato An object that conforms to the FreqSettings type that defines an oscillation in pitch
   */
  public setVibrato(vibrato?: Freq): Promise<RainlinkPlayer> {
    return this.setRaw({ vibrato: vibrato || null });
  }

  /**
   * Change the rotation settings applied to the currently playing track
   * @param rotation An object that conforms to the RotationSettings type that defines the frequency of audio rotating round the listener
   */
  public setRotation(rotation?: Rotation): Promise<RainlinkPlayer> {
    return this.setRaw({ rotation: rotation || null });
  }

  /**
   * Change the distortion settings applied to the currently playing track
   * @param distortion An object that conforms to DistortionSettings that defines distortions in the audio
   * @returns The current player instance
   */
  public setDistortion(distortion?: Distortion): Promise<RainlinkPlayer> {
    return this.setRaw({ distortion: distortion || null });
  }

  /**
   * Change the channel mix settings applied to the currently playing track
   * @param channelMix An object that conforms to ChannelMixSettings that defines how much the left and right channels affect each other (setting all factors to 0.5 causes both channels to get the same audio)
   */
  public setChannelMix(channelMix?: ChannelMix): Promise<RainlinkPlayer> {
    return this.setRaw({ channelMix: channelMix || null });
  }

  /**
   * Change the low pass settings applied to the currently playing track
   * @param lowPass An object that conforms to LowPassSettings that defines the amount of suppression on higher frequencies
   */
  public setLowPass(lowPass?: LowPass): Promise<RainlinkPlayer> {
    return this.setRaw({ lowPass: lowPass || null });
  }

  /**
   * Set a custom filter
   * @param filter The filter name
   * @returns RainlinkPlayer
   */
  public async setRaw(filter: FilterOptions): Promise<RainlinkPlayer> {
    this.checkDestroyed();
    await this.player.send({
      guildId: this.player.guildId,
      playerOptions: {
        filters: filter,
      },
    });

    this.debug("Custom filter has been successfully set. Data: " + util.inspect(filter));

    return this.player;
  }

  protected debug(logs: string) {
    this.player.manager.emit(
      RainlinkEvents.Debug,
      `[Rainlink] / [Player @ ${this.player.guildId}] / [Filter] | ${logs}`
    );
  }

  protected checkDestroyed(): void {
    if (this.player.state === RainlinkPlayerState.DESTROYED) throw new Error("Player is destroyed");
  }
}
