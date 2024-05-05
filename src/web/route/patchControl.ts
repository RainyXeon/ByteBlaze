import util from "node:util";
import { Manager } from "../../manager.js";
import Fastify from "fastify";
import { RainlinkLoopMode, RainlinkPlayer } from "../../rainlink/main.js";

export class PatchControl {
  protected skiped: boolean = false;
  constructor(protected client: Manager) {}

  async main(req: Fastify.FastifyRequest, res: Fastify.FastifyReply) {
    this.client.logger.info(
      import.meta.url,
      `${req.method} ${req.routeOptions.url} payload=${req.body ? util.inspect(req.body) : "{}"}`
    );
    const isValid = await this.checker(req, res);
    if (!isValid) return;
    const guildId = (req.params as Record<string, string>)["guildId"];
    const player = this.client.rainlink.players.get(guildId) as RainlinkPlayer;
    const jsonBody = req.body as Record<string, unknown>;
    const currentKeys = Object.keys(jsonBody);
    for (const key of currentKeys) {
      const data = await (this as any)[key](req, res, player, jsonBody[key]);
      if (!data) return;
    }
    res.send({
      loop: player.loop,
      skip: this.skiped,
      position: player.position,
    });
    this.resetData();
  }

  async loop(req: Fastify.FastifyRequest, res: Fastify.FastifyReply, player: RainlinkPlayer, mode: string) {
    if (!mode || !["song", "queue", "none"].includes(mode)) {
      res.code(400);
      res.send({ error: `Invalid loop mode, '${mode}' mode does not exist!` });
      return false;
    }
    player.setLoop(mode as RainlinkLoopMode);
    return true;
  }

  async skip(req: Fastify.FastifyRequest, res: Fastify.FastifyReply, player: RainlinkPlayer, data: string) {
    if (data === undefined || player.queue.length == 0) return true;
    await player.skip();
    this.skiped = true;
    return true;
  }

  async position(req: Fastify.FastifyRequest, res: Fastify.FastifyReply, player: RainlinkPlayer, pos: string) {
    if (!pos) return true;
    if (isNaN(Number(pos))) {
      res.code(400);
      res.send({ error: `Position must be a number!` });
      return false;
    }
    await player.seek(Number(pos));
    return true;
  }

  async checker(req: Fastify.FastifyRequest, res: Fastify.FastifyReply): Promise<boolean> {
    const accpetKey: string[] = ["loop", "skip", "position"];
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
  }
}
