import { VoiceState } from "discord.js";
import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager, oldState: VoiceState, newState: VoiceState) {
    if (!client.websocket) return;

    if (newState.channel === null && newState.id !== client.user!.id) {
      client.websocket.send(
        JSON.stringify({
          op: "voiceStateUpdateLeave",
          guild: newState.guild.id,
        })
      );
    }
  }
}
