import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager, guildId: string) {
    if (client.websocket && client.config.features.WEB_SERVER.websocket.enable)
      client.websocket.send(
        JSON.stringify({ op: "player_create", guild: guildId })
      );
  }
}
