import { Request } from "express";
import WebSocket from "ws";
import { Manager } from "../manager.js";

export class WebsocketService {
  client: Manager;
  ws: WebSocket;
  req: Request;

  constructor(client: Manager, ws: WebSocket, req: Request) {
    this.client = client;
    this.ws = ws;
    this.req = req;
    this.execute();
  }

  async security() {
    const verificationOrigin = this.req.headers.origin;

    const baseURL = this.req.protocol + "://" + this.req.headers.host + "/";

    const reqUrl = new URL(this.req.url, baseURL);

    if (
      reqUrl.searchParams.get("secret") !==
      this.client.config.features.WEB_SERVER.websocket.secret
    ) {
      this.ws.close();
      this.ws.send(
        JSON.stringify({
          error: `Disconnected to client (${verificationOrigin}) beacuse wrong secret!`,
        })
      );
      this.client.logger.websocket(
        `Disconnected to client (${verificationOrigin}) beacuse wrong secret!`
      );
      return;
    }

    if (
      this.client.config.features.WEB_SERVER.websocket.auth &&
      !this.client.config.features.WEB_SERVER.websocket.trusted.includes(
        verificationOrigin as string
      )
    ) {
      this.ws.close();
      this.ws.send(
        JSON.stringify({
          error: `Disconnected to client (${verificationOrigin}) beacuse it's not in trusted list!`,
        })
      );
      this.client.logger.websocket(
        `Disconnected to client (${verificationOrigin}) beacuse it's not in trusted list!`
      );
      return;
    }

    if (!this.client.config.features.WEB_SERVER.websocket.auth)
      this.client.logger.websocket(
        `[UNSECURE] Connected to client (${verificationOrigin})`
      );

    if (this.client.config.features.WEB_SERVER.websocket.auth)
      this.client.logger.websocket(
        `Connected to client (${verificationOrigin})`
      );
  }

  async execute() {
    this.client.logger.websocket("Connected to client!");

    this.client.websocket = this.ws;

    await this.security();

    this.ws.on("message", (message) => {
      const json = JSON.parse(String(message));
      const req = this.client.wsMessage?.get(json.message);

      if (!req) return;
      if (req) {
        this.client.logger.websocket(
          `Used [${json.message}] req by ${json.guild}`
        );
        try {
          req.run(this.client, json, this.ws);
        } catch (error) {
          this.client.logger.log({
            level: "error",
            message: String(error),
          });
          this.ws.send(JSON.stringify({ error: error }));
        }
      }
    });
    this.ws.on("error", (error) => {
      this.ws.send(JSON.stringify({ error: error }));
    });
    this.ws.on("close", () =>
      this.client.logger.websocket("Closed connection to client")
    );
  }
}
