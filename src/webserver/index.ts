import { WebSocket } from "ws";
// import express from "express";
// import expressWs from "express-ws";
import { Manager } from "../manager.js";
import Fastify from "fastify";
import websockerPlugin from "@fastify/websocket";

export class WebServer {
  app: Fastify.FastifyInstance;
  constructor(private client: Manager) {
    this.app = Fastify({
      logger: false,
    });

    this.app.get("/", (request, reply) => {
      reply.send("Alive!");
    });
    if (this.client.config.features.WEB_SERVER.websocket.enable) {
      this.websocket();
    }
    this.app.listen({ port: this.client.config.features.WEB_SERVER.port });
  }

  websocket() {
    this.app.register(websockerPlugin);
    this.app.register(async (fastify) => {
      fastify.get("/api/websocket", { websocket: true }, (socket, req) => {
        this.security(socket, req);
        this.client.websocket = socket;

        socket.on("error", (error) => {
          socket.send(JSON.stringify({ error: error }));
        });
        socket.on("close", () => this.client.logger.websocket(import.meta.url, "Closed connection to client"));
      });
    });
  }

  security(socket: WebSocket, req: Fastify.FastifyRequest) {
    const verificationOrigin = req.headers.origin;

    const baseURL = req.protocol + "://" + req.headers.host + "/";

    const reqUrl = new URL(req.url, baseURL);

    if (reqUrl.searchParams.get("secret") !== this.client.config.features.WEB_SERVER.websocket.secret) {
      socket.close();
      socket.send(
        JSON.stringify({
          error: `Disconnected to client (${verificationOrigin}) beacuse wrong secret!`,
        })
      );
      this.client.logger.websocket(
        import.meta.url,
        `Disconnected to client (${verificationOrigin}) beacuse wrong secret!`
      );
      return;
    }

    if (
      this.client.config.features.WEB_SERVER.websocket.auth &&
      !this.client.config.features.WEB_SERVER.websocket.trusted.includes(verificationOrigin as string)
    ) {
      socket.close();
      socket.send(
        JSON.stringify({
          error: `Disconnected to client (${verificationOrigin}) beacuse it's not in trusted list!`,
        })
      );
      this.client.logger.websocket(
        import.meta.url,
        `Disconnected to client (${verificationOrigin}) beacuse it's not in trusted list!`
      );
      return;
    }

    if (!this.client.config.features.WEB_SERVER.websocket.auth)
      this.client.logger.websocket(import.meta.url, `[UNSECURE] Connected to client (${verificationOrigin})`);

    if (this.client.config.features.WEB_SERVER.websocket.auth)
      this.client.logger.websocket(import.meta.url, `Connected to client (${verificationOrigin})`);
  }
}
