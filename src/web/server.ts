import { Manager } from "../manager.js";
import Fastify from "fastify";
import WebsocketPlugin from "@fastify/websocket";

export class WebServer {
  app: Fastify.FastifyInstance;
  constructor(private client: Manager) {
    this.app = Fastify({
      logger: false,
    });

    this.websocketRegister();

    this.app.get("/neko", (request, reply) => {
      client.logger.info(
        import.meta.url,
        `${request.method} ${request.routeOptions.url} payload=${request.body ? request.body : "{}"}`
      );
      reply.send("💀");
    });

    this.app.listen({ port: this.client.config.features.WEB_SERVER.port });
  }

  websocketRegister() {
    this.app.register(WebsocketPlugin);
    this.app.register((fastify) =>
      fastify.get("/websocket", { websocket: true }, (socket, req) => {
        this.client.logger.info(
          import.meta.url,
          `${req.method} ${req.routeOptions.url} payload=${req.body ? req.body : "{}"}`
        );

        socket.on("close", (code, reason) => {
          this.client.logger.websocket(import.meta.url, `Closed with code: ${code}, reason: ${reason}`);
          this.client.wsId.delete(String(req.headers["guild-id"]));
        });

        if (!req.headers["guild-id"]) {
          socket.send(JSON.stringify({ error: "Missing guild-id" }));
          socket.close(1000, JSON.stringify({ error: "Missing guild-id" }));
          return;
        }
        if (!req.headers["authentication"]) {
          socket.send(JSON.stringify({ error: "Missing authentication" }));
          socket.close(1000, JSON.stringify({ error: "Missing authentication" }));
          return;
        }

        if (req.headers["authentication"] !== this.client.config.features.WEB_SERVER.auth) {
          socket.send(JSON.stringify({ error: "Authentication failed" }));
          socket.close(1000, JSON.stringify({ error: "Authentication failed" }));
          return;
        }

        this.client.logger.websocket(import.meta.url, `Websocket opened for ${req.headers["guild-id"]}`);
        this.client.wsId.set(String(req.headers["guild-id"]), true);
      })
    );
  }
}
