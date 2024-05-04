import { Manager } from "../manager.js";
import Fastify from "fastify";

export class PlayerRoute {
  constructor(protected client: Manager) {}

  main(fastify: Fastify.FastifyInstance) {
    fastify.get("/test", (req, res) => {
      res.send({ message: "Hallo :D" });
    });
  }
}
