import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager, error: Error) {
    client.logger.error("ClientError", error);
  }
}
