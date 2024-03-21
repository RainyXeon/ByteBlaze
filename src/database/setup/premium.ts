import { Manager } from "../../manager.js";
import cron from "node-cron";
import { Premium } from "../schema/Premium.js";

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

  setupChecker() {
    const premium = Array.from(this.client.premiums.values());
    const users = premium.filter((data) => data.isPremium == true && data.expiresAt !== "lifetime");
    if (users && users.length !== 0) this.checkUser(users);
  }

  async checkUser(users: Premium[]) {
    for (let data of users) {
      if (data.expiresAt !== "lifetime" && Date.now() >= data.expiresAt) {
        await this.client.db.premium.delete(data.id);
        this.client.premiums.delete(data.id);
      }
    }
  }
}
