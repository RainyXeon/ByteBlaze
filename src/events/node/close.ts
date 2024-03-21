import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager, name: string, code: number, reason: string) {
    client.logger.debug(import.meta.url, `Lavalink ${name}: Closed, Code ${code}, Reason ${reason || "No reason"}`);
  }
}
