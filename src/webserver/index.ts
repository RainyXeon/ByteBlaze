import express from "express";
import expressWs from "express-ws";
import { Manager } from "../manager.js";
import { websocket } from "./websocket.js";
import { loadRequest } from "./loadRequest.js";

export async function WebServer(client: Manager) {
  const { app } = expressWs(express());
  const port = client.config.features.WEB_SERVER.port;

  // Websocket
  if (client.config.features.WEB_SERVER.websocket.enable) {
    loadRequest(client);
    app.ws("/websocket", function (ws, req) {
      websocket(client, ws, req);
    });
  }

  // Alive route
  app.use("/", (req, res) => {
    res.send("Alive!");
    res.end();
  });

  app.listen(port, "127.0.0.1");

  client.logger.info(`Running web server in port: ${port}`);
}
