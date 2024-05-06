import { User } from "discord.js";
import { Manager } from "../../manager.js";
import Fastify from "fastify";

export async function getQueueStatus(client: Manager, req: Fastify.FastifyRequest, res: Fastify.FastifyReply) {
  client.logger.info(import.meta.url, `${req.method} ${req.routeOptions.url}`);
  const guildId = (req.params as Record<string, string>)["guildId"];
  const player = client.rainlink.players.get(guildId);
  if (!player) {
    res.code(404);
    res.send({ error: "Current player not found!" });
    return;
  }
  return player.queue.map((track) => {
    const requesterQueue = track.requester as User;
    return {
      encoded: track.encoded,
      title: track.title,
      uri: track.uri,
      length: track.duration,
      thumbnail: track.artworkUrl,
      author: track.author,
      requester: requesterQueue
        ? {
            id: requesterQueue.id,
            username: requesterQueue.username,
            globalName: requesterQueue.globalName,
            defaultAvatarURL: requesterQueue.defaultAvatarURL ?? null,
          }
        : null,
    };
  });
}
