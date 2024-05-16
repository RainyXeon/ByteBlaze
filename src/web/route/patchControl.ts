import util from "node:util";
import { Manager } from "../../manager.js";
import Fastify from "fastify";
import { RainlinkLoopMode, RainlinkPlayer } from "../../rainlink/main.js";

export type TrackRes = {
  title: string;
  uri: string;
  length: number;
  thumbnail: string;
  author: string;
  requester: null;
};

export class PatchControl {
  protected skiped: boolean = false;
  protected isPrevious: boolean = false;
  protected addedTrack: TrackRes[] = [];
  constructor(protected client: Manager) {}

  async main(req: Fastify.FastifyRequest, res: Fastify.FastifyReply) {
    this.client.logger.info(
      PatchControl.name,
      `${req.method} ${req.routeOptions.url} payload=${req.body ? util.inspect(req.body) : "{}"}`
    );
    const isValid = await this.checker(req, res);
    if (!isValid) return;
    const guildId = (req.params as Record<string, string>)["guildId"];
    const player = this.client.rainlink.players.get(guildId) as RainlinkPlayer;
    const jsonBody = req.body as Record<string, unknown>;
    const currentKeys = Object.keys(jsonBody);
    for (const key of currentKeys) {
      const data = await (this as any)[key](res, player, jsonBody[key]);
      if (!data) return;
    }
    res.send({
      loop: jsonBody.loop,
      skiped: this.skiped,
      previous: this.isPrevious,
      position: jsonBody.position,
      volume: jsonBody.volume,
      added: this.addedTrack,
    });
    this.resetData();
  }

  async loop(res: Fastify.FastifyReply, player: RainlinkPlayer, mode: string) {
    if (!mode || !["song", "queue", "none"].includes(mode)) {
      res.code(400);
      res.send({ error: `Invalid loop mode, '${mode}' mode does not exist!` });
      return false;
    }
    player.setLoop(mode as RainlinkLoopMode);
    return true;
  }

  async skipMode(res: Fastify.FastifyReply, player: RainlinkPlayer, mode: string) {
    if (!mode || !["previous", "skip"].includes(mode)) {
      res.code(400);
      res.send({ error: `Invalid loop mode, '${mode}' mode does not exist!` });
      return false;
    }
    if (player.queue.length == 0) return true;
    if (mode == "skip") {
      await player.skip();
      this.skiped = true;
      return true;
    }
    await player.previous();
    this.isPrevious = true;
    return true;
  }

  async position(res: Fastify.FastifyReply, player: RainlinkPlayer, pos: string) {
    if (isNaN(Number(pos))) {
      res.code(400);
      res.send({ error: `Position must be a number!` });
      return false;
    }
    await player.seek(Number(pos));
    return true;
  }

  async volume(res: Fastify.FastifyReply, player: RainlinkPlayer, vol: string) {
    if (!vol) return true;
    if (isNaN(Number(vol))) {
      res.code(400);
      res.send({ error: `Volume must be a number!` });
      return false;
    }
    await player.setVolume(Number(vol));
    return true;
  }

  async add(res: Fastify.FastifyReply, player: RainlinkPlayer, uriArray: string) {
    if (!uriArray) return true;
    for (const uri of uriArray) {
      if (!this.isValidHttpUrl(uri)) {
        res.code(400);
        res.send({ error: `add property must have a link!` });
        return false;
      }
      const result = await this.client.rainlink.search(uri);
      if (result.tracks.length == 0) {
        res.code(400);
        res.send({ error: `Track not found!` });
        return false;
      }
      const song = result.tracks[0];
      player.queue.add(song);
      this.addedTrack.push({
        title: song.title,
        uri: song.uri || "",
        length: song.duration,
        thumbnail: song.artworkUrl || "",
        author: song.author,
        requester: null,
      });
    }
    return true;
  }

  async checker(req: Fastify.FastifyRequest, res: Fastify.FastifyReply): Promise<boolean> {
    const accpetKey: string[] = ["loop", "skipMode", "position", "volume", "add"];
    const guildId = (req.params as Record<string, string>)["guildId"];
    const player = this.client.rainlink.players.get(guildId);
    if (!player) {
      res.code(404);
      res.send({ error: "Current player not found!" });
      return false;
    }
    if (req.headers["content-type"] !== "application/json") {
      res.code(400);
      res.send({ error: "content-type must be application/json!" });
      return false;
    }
    if (!req.body) {
      res.code(400);
      res.send({ error: "Missing body" });
      return false;
    }
    const jsonBody = req.body as Record<string, unknown>;
    for (const key of Object.keys(jsonBody)) {
      if (!accpetKey.includes(key)) {
        res.code(400);
        res.send({ error: `Invalid body, key '${key}' does not exist!` });
        return false;
      }
    }
    return true;
  }

  resetData() {
    this.skiped = false;
    this.addedTrack = [];
    this.isPrevious = false;
  }

  isValidHttpUrl(string: string) {
    let url;

    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
  }
}
