import { User } from "discord.js";
import { Manager } from "../../manager.js";
import Fastify from "fastify";

export async function getStatus(client: Manager, req: Fastify.FastifyRequest, res: Fastify.FastifyReply) {
  client.logger.info(import.meta.url, `${req.method} ${req.routeOptions.url}`);
  let isMemeberInVoice = "notGiven";
  const guildId = (req.params as Record<string, string>)["guildId"];
  const player = client.rainlink.players.get(guildId);
  if (!player) {
    res.code(404);
    res.send({ error: "Current player not found!" });
    return;
  }
  if (req.headers["user-id"]) {
    const userId = req.headers["user-id"] as string;
    const Guild = await client.guilds.fetch(guildId);
    const Member = await Guild.members.fetch(userId);
    if (!Member.voice.channel || !Member.voice) isMemeberInVoice = "false";
    else isMemeberInVoice = "true";
  }

  const song = player.queue.current;
  const requester = song ? (song.requester as User) : null;

  res.send({
    guildId: player.guildId,
    loop: player.loop,
    pause: player.paused,
    member: isMemeberInVoice,
    position: player.position,
    current: song
      ? {
          encoded: song.encoded,
          title: song.title,
          uri: song.uri,
          length: song.duration,
          thumbnail: song.artworkUrl,
          author: song.author,
          requester: requester
            ? {
                id: requester.id,
                username: requester.username,
                globalName: requester.globalName,
                defaultAvatarURL: requester.defaultAvatarURL ?? null,
              }
            : null,
        }
      : null,
    queue: player.queue.map((track) => {
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
    }),
  });
}
