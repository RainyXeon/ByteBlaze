import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager, guildId: string) {
    if (!client.websocket) return;
    client.websocket.send(
      JSON.stringify({ op: "player_create", guild: guildId })
    );
  }
}
