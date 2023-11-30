import { Manager } from "../../manager.js";
import { JSON_MESSAGE } from "../../@types/Websocket.js";
import { RequestInterface } from "../RequestInterface.js";
import WebSocket from "ws";

export default class implements RequestInterface {
  name = "search";
  run = async (client: Manager, json: JSON_MESSAGE, ws: WebSocket) => {
    const result = await client.manager.search(json.query, {
      engine: json.source ? json.source : "soundcloud",
      requester: null,
    });

    ws.send(
      JSON.stringify({ op: "search", guild: json.guild, queue: result.tracks })
    );
  };
}
