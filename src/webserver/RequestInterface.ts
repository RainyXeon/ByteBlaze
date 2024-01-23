import { JSON_MESSAGE } from "../@types/Websocket.js";
import { Manager } from "../manager.js";
import WebSocket from "ws";

export class RequestInterface {
  name: string = "";
  async run(client: Manager, json: JSON_MESSAGE, ws: WebSocket): Promise<any> {}
}
