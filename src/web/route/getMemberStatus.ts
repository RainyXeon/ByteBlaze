import util from "node:util";
import { Manager } from "../../manager.js";
import Fastify from "fastify";

export async function getMemberStatus(client: Manager, req: Fastify.FastifyRequest, res: Fastify.FastifyReply) {
  client.logger.info(
    "StatusRouterService",
    `${req.method} ${req.routeOptions.url} params=${req.params ? util.inspect(req.params) : "{}"}`
  );
  let isMemeberInVoice = false;
  const guildId = (req.params as Record<string, string>)["guildId"];
  const player = client.rainlink.players.get(guildId);
  if (!player) {
    res.code(400);
    res.send({ error: "Current player not found!" });
    return;
  }
  const userId = req.headers["user-id"] as string;
  const Guild = await client.guilds.fetch(guildId).catch(() => undefined);
  if (!Guild) {
    res.code(400);
    res.send({ error: "Guild not found" });
    return;
  }
  const Member = await Guild.members.fetch(userId).catch(() => undefined);
  if (!(!Member || !Member.voice.channel || !Member.voice)) isMemeberInVoice = true;
  res.send({ data: isMemeberInVoice });
  return;
}
