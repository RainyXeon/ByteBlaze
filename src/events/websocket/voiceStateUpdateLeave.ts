import { VoiceState } from "discord.js";
import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager, oldState: VoiceState, newState: VoiceState) {
    if (
      client.websocket &&
      client.config.features.WEB_SERVER.websocket.enable
    ) {
      if (newState.channel === null && newState.id !== client.user!.id) {
        client.websocket.send(
          JSON.stringify({
            op: "voice_state_update_leave",
            guild: newState.guild.id,
          })
        );
      }
    }
  }
}
