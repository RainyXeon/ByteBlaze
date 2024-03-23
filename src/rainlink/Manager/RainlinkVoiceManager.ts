// Modded from: https://github.com/shipgirlproject/Shoukaku/blob/396aa531096eda327ade0f473f9807576e9ae9df/src/guild/Connection.ts
// Special thanks to shipgirlproject team!

import { EventEmitter } from "events";
import { RainlinkEvents, VoiceConnectState, VoiceState } from "../Interface/Constants.js";
import { Rainlink } from "../Rainlink.js";
import { VoiceChannelOptions } from "../Interface/Player.js";
import { ServerUpdate, StateUpdatePartial } from "../Interface/Connection.js";

export class RainlinkVoiceManager extends EventEmitter {
  /**
   * The manager where this connection is on
   */
  public manager: Rainlink;
  /**
   * ID of Guild that contains the connected voice channel
   */
  public guildId: string;
  /**
   * ID of the connected voice channel
   */
  public voiceId: string | null;
  /**
   * ID of the Shard that contains the guild that contains the connected voice channel
   */
  public shardId: number;
  /**
   * Mute status in connected voice channel
   */
  public mute: boolean;
  /**
   * Deafen status in connected voice channel
   */
  public deaf: boolean;
  /**
   * ID of the last voiceId connected to
   */
  public lastvoiceId: string | null;
  /**
   * ID of current session
   */
  public sessionId: string | null;
  /**
   * Region of connected voice channel
   */
  public region: string | null;
  /**
   * Last region of the connected voice channel
   */
  public lastRegion: string | null;
  /**
   * Cached serverUpdate event from Lavalink
   */
  public serverUpdate: ServerUpdate | null;
  /**
   * Connection state
   */
  public state: VoiceConnectState;

  /**
   * The main class for handling discord voice connections
   * @param manager The rainlink manager
   * @param options The options to pass in voice manager creation
   */
  constructor(manager: Rainlink, options: VoiceChannelOptions) {
    super();
    this.manager = manager;
    this.guildId = options.guildId;
    this.voiceId = options.voiceId;
    this.shardId = options.shardId;
    this.mute = options.mute ?? false;
    this.deaf = options.deaf ?? false;
    this.lastvoiceId = null;
    this.sessionId = null;
    this.region = null;
    this.lastRegion = null;
    this.serverUpdate = null;
    this.state = VoiceConnectState.DISCONNECTED;
  }

  /**
   * Connect the current bot user to a voice channel
   * @internal
   */
  public async connect(): Promise<void> {
    if (this.state === VoiceConnectState.CONNECTING || this.state === VoiceConnectState.CONNECTED) return;
    this.state = VoiceConnectState.CONNECTING;
    this.sendVoiceUpdate();
    this.debug(`Requesting Connection | Guild: ${this.guildId}`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.manager.rainlinkOptions.options!.voiceConnectionTimeout);
    try {
      const [status] = await RainlinkVoiceManager.once(this, "connectionUpdate", {
        signal: controller.signal,
      });
      if (status !== VoiceState.SESSION_READY) {
        switch (status) {
          case VoiceState.SESSION_ID_MISSING:
            throw new Error("The voice connection is not established due to missing session id");
          case VoiceState.SESSION_ENDPOINT_MISSING:
            throw new Error("The voice connection is not established due to missing connection endpoint");
        }
      }
      this.state = VoiceConnectState.CONNECTED;
    } catch (error: any) {
      this.debug(`Request Connection Failed | Guild: ${this.guildId}`);
      if (error.name === "AbortError")
        throw new Error(
          `The voice connection is not established in ${this.manager.rainlinkOptions.options!.voiceConnectionTimeout}ms`
        );
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Sets the server update data for this connection
   * @internal
   */
  public setServerUpdate(data: ServerUpdate): void {
    if (!data.endpoint) {
      this.emit("connectionUpdate", VoiceState.SESSION_ENDPOINT_MISSING);
      return;
    }
    if (!this.sessionId) {
      this.emit("connectionUpdate", VoiceState.SESSION_ID_MISSING);
      return;
    }

    this.lastRegion = this.region?.repeat(1) || null;
    this.region = data.endpoint.split(".").shift()?.replace(/[0-9]/g, "") || null;

    if (this.region && this.lastRegion !== this.region) {
      this.debug(
        `Voice Region Moved | Old Region: ${this.lastRegion} New Region: ${this.region} Guild: ${this.guildId}`
      );
    }

    this.serverUpdate = data;
    this.emit("connectionUpdate", VoiceState.SESSION_READY);
    this.debug(`Server Update Received | Server: ${this.region} Guild: ${this.guildId}`);
  }

  /**
   * Update Session ID, Channel ID, Deafen status and Mute status of this instance
   * @internal
   */
  public setStateUpdate({ session_id, channel_id, self_deaf, self_mute }: StateUpdatePartial): void {
    this.lastvoiceId = this.voiceId?.repeat(1) || null;
    this.voiceId = channel_id || null;

    if (this.voiceId && this.lastvoiceId !== this.voiceId) {
      this.debug(`Channel Moved | Old Channel: ${this.voiceId} Guild: ${this.guildId}`);
    }

    if (!this.voiceId) {
      this.state = VoiceConnectState.DISCONNECTED;
      this.debug(`Channel Disconnected | Guild: ${this.guildId}`);
    }

    this.deaf = self_deaf;
    this.mute = self_mute;
    this.sessionId = session_id || null;
    this.debug(`State Update Received | Channel: ${this.voiceId} Session ID: ${session_id} Guild: ${this.guildId}`);
  }

  /**
   * Send voice data to discord
   * @internal
   */
  public sendVoiceUpdate() {
    this.send({
      guild_id: this.guildId,
      channel_id: this.voiceId,
      self_deaf: this.deaf,
      self_mute: this.mute,
    });
  }

  /**
   * Send data to Discord
   * @param data The data to send
   * @internal
   */
  public send(data: any): void {
    this.manager.library.sendPacket(this.shardId, { op: 4, d: data }, false);
  }

  /**
   * Disconnect the current bot user from the connected voice channel
   * @internal
   */
  public disconnect(): void {
    if (this.state === VoiceConnectState.DISCONNECTED) return;
    this.voiceId = null;
    this.deaf = false;
    this.mute = false;
    this.removeAllListeners();
    this.sendVoiceUpdate();
    this.state = VoiceConnectState.DISCONNECTED;
    this.debug(`Connection Destroyed | Guild: ${this.guildId}`);
  }

  /** @ignore */
  private debug(logs: string) {
    this.manager.emit(RainlinkEvents.Debug, `[Rainlink Voice Manager]: ${logs}`);
  }
}
