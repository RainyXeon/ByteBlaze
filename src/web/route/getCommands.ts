import { Manager } from "../../manager.js";
import Fastify from "fastify";

export async function getCommands(client: Manager, req: Fastify.FastifyRequest, res: Fastify.FastifyReply) {
  client.logger.info("CommandRouterService", `${req.method} ${req.routeOptions.url} payload={}`);
  res.send({
    data: client.commands.map((command) => ({
      name: command.name.join("-"),
      description: command.description,
      category: command.category,
      accessableby: command.accessableby,
      usage: command.usage,
      aliases: command.aliases,
    })),
  });
}
