import { VoiceState } from "discord.js";
import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager, oldState: VoiceState, newState: VoiceState) {
    if (!client.websocket) return;

    if (oldState.channel === null && oldState.id !== client.user!.id) {
      client.websocket.send(
        JSON.stringify({
          op: "voice_state_update_join",
          guild: newState.guild.id,
        })
      );
    }
  }
}
