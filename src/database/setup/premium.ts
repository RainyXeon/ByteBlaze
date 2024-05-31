import { Manager } from "../../manager.js";
import cron from "node-cron";
import { Premium } from "../schema/Premium.js";
import { GuildPremium } from "../schema/GuildPremium.js";

export class PremiumScheduleSetup {
  client: Manager;
  constructor(client: Manager) {
    this.client = client;
    this.execute();
  }

  async execute() {
    this.setupChecker();
    cron.schedule("0 */1 * * * *", () => this.setupChecker());
  }

  async setupChecker() {
    const premium = Array.from(await this.client.db.premium.all());
    const users = premium.filter(
      (data) => data.value.isPremium == true && data.value.expiresAt !== "lifetime"
    );
    if (users && users.length !== 0) this.checkUser(users.map((data) => data.value));

    const premiumGuild = Array.from(await this.client.db.premium.all());
    const guilds = premiumGuild.filter(
      (data) => data.value.isPremium == true && data.value.expiresAt !== "lifetime"
    );
    if (guilds && guilds.length !== 0) this.checkGuild(guilds.map((data) => data.value));
  }

  async checkUser(users: Premium[]) {
    for (let data of users) {
      if (data.expiresAt !== "lifetime" && Date.now() >= data.expiresAt) {
        await this.client.db.premium.delete(data.id);
      }
    }
  }

  async checkGuild(users: GuildPremium[]) {
    for (let data of users) {
      if (data.expiresAt !== "lifetime" && Date.now() >= data.expiresAt) {
        await this.client.db.premium.delete(data.id);
      }
    }
  }
}
