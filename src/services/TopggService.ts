import cron from "node-cron";
import { Snowflake } from "discord.js";
import { Manager } from "../manager.js";
import { request } from "undici";

export enum TopggServiceEnum {
  ERROR,
  VOTED,
  UNVOTED,
}

export class TopggService {
  isTokenAvalible: boolean = false;
  botId?: string;
  url: string = "https://top.gg/api";

  constructor(private client: Manager) {}

  public async settingUp(userId: Snowflake) {
    const res = await this.fetch(`/bots/${userId}/stats`);
    if (res.status == 200) {
      this.isTokenAvalible = true;
      this.botId = userId;
      this.client.logger.info(TopggService.name, "Topgg service has been successfully set up!");
      return true;
    }
    this.client.logger.error(TopggService.name, "There was a problem setting up the topgg service");
    this.client.logger.error(TopggService.name, await res.text());
    return false;
  }

  public async checkVote(userId: string): Promise<TopggServiceEnum> {
    if (!this.botId || !this.isTokenAvalible) {
      this.client.logger.error(TopggService.name, "TopGG service not setting up! check vote will always return false");
      return TopggServiceEnum.ERROR;
    }
    const res = await this.fetch(`/bots/${this.botId}/check?userId=${userId}`);
    if (res.status !== 200) {
      this.client.logger.error(TopggService.name, "There was a problem when fetching data from top.gg");
      return TopggServiceEnum.ERROR;
    }
    const jsonRes = (await res.json()) as { voted: number };
    if (jsonRes.voted !== 0) return TopggServiceEnum.VOTED;
    return TopggServiceEnum.UNVOTED;
  }

  private async fetch(path: string) {
    return await fetch(this.url + path, {
      headers: {
        Authorization: this.client.config.features.TOPGG_TOKEN,
      },
    });
  }

  public async startInterval() {
    if (!this.botId || !this.isTokenAvalible) throw new Error("TopGG service not setting up!");
    this.updateServerCount(this.client.guilds.cache.size);
    cron.schedule("0 */1 * * * *", () => this.updateServerCount(this.client.guilds.cache.size));
    this.client.logger.info(TopggService.name, "Topgg server count update service has been successfully set up!");
  }

  public async updateServerCount(count: number) {
    if (!this.botId || !this.isTokenAvalible) throw new Error("TopGG service not setting up!");
    await request(this.url + `/bots/${this.botId}/stats`, {
      method: "POST",
      body: JSON.stringify({
        server_count: count,
      }),
      headers: {
        Authorization: this.client.config.features.TOPGG_TOKEN,
        "Content-Type": "application/json",
      },
    });
  }
}
