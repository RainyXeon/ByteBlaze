import { Request } from "express";
import WebSocket from "ws";
import { Manager } from "../manager.js";

export async function websocket(client: Manager, ws: WebSocket, req: Request) {
  client.websocket = ws;

  client.logger.info("Connected to client!");

  const verificationOrigin = req.headers.origin;

  const baseURL = req.protocol + "://" + req.headers.host + "/";

  const reqUrl = new URL(req.url, baseURL);

  if (
    reqUrl.searchParams.get("secret") !==
    client.config.features.WEB_SERVER.websocket.secret
  ) {
    ws.close();
    ws.send(
      JSON.stringify({
        error: `Disconnected to client (${verificationOrigin}) beacuse wrong secret!`,
      })
    );
    client.logger.info(
      `Disconnected to client (${verificationOrigin}) beacuse wrong secret!`
    );
    return;
  }

  if (
    client.config.features.WEB_SERVER.websocket.auth &&
    !client.config.features.WEB_SERVER.websocket.trusted.includes(
      verificationOrigin
    )
  ) {
    ws.close();
    ws.send(
      JSON.stringify({
        error: `Disconnected to client (${verificationOrigin}) beacuse it's not in trusted list!`,
      })
    );
    client.logger.info(
      `Disconnected to client (${verificationOrigin}) beacuse it's not in trusted list!`
    );
    return;
  }

  if (!client.config.features.WEB_SERVER.websocket.auth)
    client.logger.warn(
      `[UNSECURE] Connected to client (${verificationOrigin})`
    );

  if (client.config.features.WEB_SERVER.websocket.auth)
    client.logger.info(`Connected to client (${verificationOrigin})`);

  ws.on("message", (message) => {
    const json = JSON.parse(String(message));
    const req = client.ws_message?.get(json.message);

    if (!req) return;
    if (req) {
      client.logger.info(`Used [${json.message}] req by ${json.guild}`);
      try {
        req.run(client, json, ws);
      } catch (error) {
        client.logger.log({
          level: "error",
          message: error,
        });
        ws.send(JSON.stringify({ error: error }));
      }
    }
  });
  ws.on("error", (error) => {
    ws.send(JSON.stringify({ error: error }));
  });
  ws.on("close", () => client.logger.info("Closed connection to client"));
}
