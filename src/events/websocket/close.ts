import { Manager } from "../../manager.js";

export default async (client: Manager, ws: WebSocket) => {
  client.logger.info("Closed connection to client");
};
