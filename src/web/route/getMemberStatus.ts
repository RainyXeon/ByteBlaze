import { Manager } from "../../manager.js";
import Fastify from "fastify";

export async function getMemberStatus(client: Manager, req: Fastify.FastifyRequest, res: Fastify.FastifyReply) {
  client.logger.info(import.meta.url, `${req.method} ${req.routeOptions.url}`);
  let isMemeberInVoice = false;
  const guildId = (req.params as Record<string, string>)["guildId"];
  const player = client.rainlink.players.get(guildId);
  if (!player) {
    res.code(404);
    res.send({ error: "Current player not found!" });
    return;
  }
  const userId = req.headers["user-id"] as string;
  const Guild = await client.guilds.fetch(guildId);
  const Member = await Guild.members.fetch(userId);
  if (!(!Member.voice.channel || !Member.voice)) isMemeberInVoice = true;
  res.send({ status: isMemeberInVoice });
  return;
}
