import { Manager } from "../manager.js";
import Fastify from "fastify";
import WebsocketPlugin from "@fastify/websocket";
import { WebsocketRoute } from "./websocket.js";
import { PlayerRoute } from "./player.js";

export class WebServer {
  app: Fastify.FastifyInstance;
  constructor(private client: Manager) {
    this.app = Fastify({
      logger: false,
    });

    this.app.register(
      (fastify, _, done) => {
        fastify.addHook("preValidation", function hook(req, reply, done) {
          if (!req.headers["authorization"]) {
            reply.code(401);
            reply.send(JSON.stringify({ error: "Missing Authorization" }));
            return done();
          }
          if (req.headers["authorization"] !== client.config.features.WEB_SERVER.auth) {
            reply.code(401);
            reply.send(JSON.stringify({ error: "Authorization failed" }));
            return done();
          }
          done();
        });
        fastify.register(WebsocketPlugin);
        fastify.register((fastify, _, done) => {
          new WebsocketRoute(client).main(fastify);
          done();
        });
        fastify.register(
          (fastify, _, done) => {
            new PlayerRoute(client).main(fastify);
            done();
          },
          { prefix: "players" }
        );
        fastify.get("/test", (req, res) => res.send({ message: "Hallo :D" }));
        done();
      },
      { prefix: "v1" }
    );

    this.app.get("/neko", (request, reply) => {
      client.logger.info(import.meta.url, `${request.method} ${request.routeOptions.url}`);
      reply.send("💀");
    });

    this.app.listen({ port: this.client.config.features.WEB_SERVER.port });
  }
}
