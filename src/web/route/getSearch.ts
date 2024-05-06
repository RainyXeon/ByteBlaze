import { User } from "discord.js";
import { Manager } from "../../manager.js";
import Fastify from "fastify";

export async function getSearch(client: Manager, req: Fastify.FastifyRequest, res: Fastify.FastifyReply) {
  client.logger.info(import.meta.url, `${req.method} ${req.routeOptions.url}`);
  const query = (req.query as Record<string, string>)["search"];
  const requester = (req.query as Record<string, string>)["requester"];
  const source = (req.query as Record<string, string>)["source"];
  let validSource = "youtube";
  if (source) {
    const isSourceExist = client.rainlink.searchEngines.get(source);
    if (isSourceExist) validSource = source;
  }
  const user = await client.users.fetch(requester).catch(() => {});
  if (!query) {
    res.code(404);
    res.send({ error: "Search param not found" });
    return;
  }
  const result = await client.rainlink.search(query, { requester: user });
  res.send({
    type: result.type,
    playlistName: result.playlistName ?? null,
    tracks: result.tracks.map((track) => {
      const requesterQueue = track.requester as User;
      return {
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
    }),
  });
}
