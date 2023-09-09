import { WebSocket } from "ws";
import { Manager } from "../../manager.js";

export default async (client: Manager, ws: WebSocket, request: any) => {
  client.logger.info("Connected to client!");

  const verificationOrigin = request.headers.origin;

  const baseURL = request.protocol + "://" + request.headers.host + "/";

  const reqUrl = new URL(request.url, baseURL);

  if (
    reqUrl.searchParams.get("secret") !==
    client.config.features.WEBSOCKET.secret
  ) {
    ws.close();
    ws.send(
      JSON.stringify({
        error: `Disconnected to client (${verificationOrigin}) beacuse wrong secret!`,
      }),
    );
    client.logger.info(
      `Disconnected to client (${verificationOrigin}) beacuse wrong secret!`,
    );
    return;
  }

  if (
    client.config.features.WEBSOCKET.auth &&
    !client.config.features.WEBSOCKET.trusted.includes(verificationOrigin)
  ) {
    ws.close();
    ws.send(
      JSON.stringify({
        error: `Disconnected to client (${verificationOrigin}) beacuse it's not in trusted list!`,
      }),
    );
    client.logger.info(
      `Disconnected to client (${verificationOrigin}) beacuse it's not in trusted list!`,
    );
    return;
  }

  if (!client.config.features.WEBSOCKET.auth)
    client.logger.warn(
      `[UNSECURE] Connected to client (${verificationOrigin})`,
    );

  if (client.config.features.WEBSOCKET.auth)
    client.logger.info(`Connected to client (${verificationOrigin})`);

  ws.on("message", (message) => {
    const json = JSON.parse(String(message));
    const req = client.wss.message.get(json.message);

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

  client.websocket = ws;
};
