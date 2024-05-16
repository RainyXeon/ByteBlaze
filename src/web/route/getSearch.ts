import util from "node:util";
import { User } from "discord.js";
import { Manager } from "../../manager.js";
import Fastify from "fastify";
import { RainlinkSearchResultType } from "../../rainlink/main.js";

export async function getSearch(client: Manager, req: Fastify.FastifyRequest, res: Fastify.FastifyReply) {
  client.logger.info(
    "SearchRouterService",
    `${req.method} ${req.routeOptions.url} query=${req.query ? util.inspect(req.query) : "{}"}`
  );
  const query = (req.query as Record<string, string>)["identifier"];
  const requester = (req.query as Record<string, string>)["requester"];
  const source = (req.query as Record<string, string>)["source"];
  let validSource = "youtube";
  if (source) {
    const isSourceExist = client.rainlink.searchEngines.get(source);
    if (isSourceExist) validSource = source;
  }
  const user = await client.users.fetch(requester).catch(() => undefined);
  if (!query) {
    res.code(400);
    res.send({ error: "Search param not found" });
    return;
  }
  const result = await client.rainlink.search(query, { requester: user, engine: source }).catch(() => ({
    playlistName: "dreamvast@error@noNode",
    tracks: [],
    type: RainlinkSearchResultType.SEARCH,
  }));
  if (result.tracks.length == 0 && result.playlistName == "dreamvast@error@noNode") {
    res.code(404);
    res.send({ error: "No node avaliable!" });
    return;
  }
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
