import { Manager } from "../../manager.js";
import cron from "node-cron";
import { Premium } from "../schema/Premium.js";

export class PremiumScheduleSetup {
  client: Manager;
  constructor(client: Manager) {
    this.client = client;
    this.execute();
  }

  execute() {
    cron.schedule("0 */1 * * * *", async () => {
      const premium = await this.client.db.premium.all();
      const users = premium.filter((data) => data.value.isPremium == true);

      if (users && users.length !== 0) this.checkUser(users);
    });
  }

  async checkUser(users: { id: string; value: Premium }[]) {
    for (let data of users) {
      const user = data.value;

      if (Date.now() >= user.expiresAt) {
        await this.client.db.premium.delete(data.id);
        this.client.premiums.delete(data.value.id);
      }
    }
  }
}
