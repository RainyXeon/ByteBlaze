import { WebSocket } from "ws";
import { JSON_MESSAGE } from "../@types/Websocket.js";
import { Manager } from "../manager.js";

export class RequestInterface {
  name: string = "";
  async run(client: Manager, json: JSON_MESSAGE, ws: WebSocket) {}
}
