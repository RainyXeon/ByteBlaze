import util from "node:util";
import { Manager } from "../../manager.js";
import Fastify from "fastify";

export async function deletePlayer(client: Manager, req: Fastify.FastifyRequest, res: Fastify.FastifyReply) {
  client.logger.info(
    "PlayerRouterService",
    `${req.method} ${req.routeOptions.url} params=${req.params ? util.inspect(req.params) : "{}"}`
  );
  const guildId = (req.params as Record<string, string>)["guildId"];
  const player = client.rainlink.players.get(guildId);
  if (!player) {
    res.code(404);
    res.send({ error: "Current player not found!" });
    return;
  }
  await player.destroy();
  res.code(204);
}
