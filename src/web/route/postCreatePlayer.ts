import util from "node:util";
import { Guild, GuildMember } from "discord.js";
import { Manager } from "../../manager.js";
import Fastify from "fastify";

export class PostCreatePlayer {
  guild: Guild | null = null;
  member: GuildMember | null = null;
  constructor(protected client: Manager) {}

  async main(req: Fastify.FastifyRequest, res: Fastify.FastifyReply) {
    this.client.logger.info(
      PostCreatePlayer.name,
      `${req.method} ${req.routeOptions.url} payload=${req.body ? util.inspect(req.body) : "{}"}`
    );
    const data = req.body as Record<string, string>;
    const validBody = await this.checker(data, req, res);
    if (!validBody) return;
    const playerData = {
      guildId: this.guild!.id,
      voiceId: this.member!.voice.channel!.id,
      textId: "",
      shardId: this.guild?.shardId ?? 0,
      deaf: true,
      volume: this.client.config.lavalink.DEFAULT_VOLUME ?? 100,
    };
    this.client.rainlink.create(playerData);
    res.send(playerData);
  }

  clean() {
    this.guild = null;
    this.member = null;
  }

  async checker(
    data: Record<string, string>,
    req: Fastify.FastifyRequest,
    res: Fastify.FastifyReply
  ): Promise<boolean> {
    const reqKey = ["guildId", "userId"];
    if (!data) return this.errorRes(req, res, "Missing body");
    if (Object.keys(data).length !== reqKey.length) return this.errorRes(req, res, "Missing key");
    if (!data["guildId"]) return this.errorRes(req, res, "Missing guildId key");
    if (!data["userId"]) return this.errorRes(req, res, "Missing userId key");
    const Guild = await this.client.guilds.fetch(data["guildId"]).catch(() => undefined);
    if (!Guild) return this.errorRes(req, res, "Guild not found");
    const isPlayerExist = this.client.rainlink.players.get(Guild.id);
    if (isPlayerExist) return this.errorRes(req, res, "Player existed in this guild");
    this.guild = Guild;
    const Member = await Guild.members.fetch(data["userId"]).catch(() => undefined);
    if (!Member) return this.errorRes(req, res, "User not found");
    if (!Member.voice.channel || !Member.voice) return this.errorRes(req, res, "User is not in voice");
    this.member = Member;
    return true;
  }

  async errorRes(req: Fastify.FastifyRequest, res: Fastify.FastifyReply, message: string) {
    res.code(400);
    res.send({ error: message });
    this.clean();
    return false;
  }
}
