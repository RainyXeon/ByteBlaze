import { Manager } from "../../manager.js";

export default async (client: Manager, ws: any) => {
  client.logger.info("Closed connection to client");
};
