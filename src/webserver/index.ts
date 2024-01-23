import express from "express";
import expressWs from "express-ws";
import { Manager } from "../manager.js";
import { WebsocketService } from "./websocket.js";
import { loadRequest } from "./loadRequest.js";

export class WebServer {
  client: Manager;
  app: expressWs.Application;
  port: number;
  constructor(client: Manager) {
    this.client = client;
    this.app = expressWs(express()).app;
    this.port = this.client.config.features.WEB_SERVER.port;
    if (this.client.config.features.WEB_SERVER.websocket.enable) {
      this.websocket();
    }
    this.alive();
    this.expose();
  }

  websocket() {
    const client = this.client;

    new loadRequest(client);
    this.app.ws("/websocket", function (ws, req) {
      new WebsocketService(client, ws, req);
    });
  }

  alive() {
    this.app.use("/", (req, res) => {
      res.send("Alive!");
      res.end();
    });
  }

  expose() {
    this.app.listen(this.port);
    this.client.logger.info(`Running web server in port: ${this.port}`);
  }
}
