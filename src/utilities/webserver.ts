import { Manager } from "../manager.js";
import Fastify from "fastify";

export class WebServer {
  app: Fastify.FastifyInstance;
  constructor(private client: Manager) {
    this.app = Fastify({
      logger: false,
    });

    this.app.get("/", (request, reply) => {
      reply.send("Alive!");
    });
    this.app.listen({ port: this.client.config.features.WEB_SERVER.port });
  }
}
