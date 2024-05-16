import ms from "pretty-ms";
import { EmbedBuilder, TextChannel, version } from "discord.js";
import { Manager } from "../../manager.js";
import chalk from "chalk";
import cron from "node-cron";
import os from "os";
import { stripIndents } from "common-tags";

export class ClientDataService {
  client: Manager;
  constructor(client: Manager) {
    this.client = client;
    this.execute();
  }

  get infoChannelembed() {
    const total = os.totalmem() / 1024 / 1024;
    const used = process.memoryUsage().rss / 1024 / 1024;

    const hostInfo = stripIndents`\`\`\`
    - OS: ${os.type()} ${os.release()} (${os.arch()})
    - CPU: ${os.cpus()[0].model}
    - Uptime: ${ms(this.client.uptime as number)}
    - RAM: ${(total / 1024).toFixed(2)} GB
    - Memory Usage: ${used.toFixed(2)}/${total.toFixed(2)} (MB)
    - Node.js: ${process.version}
    \`\`\``;

    const botInfo = stripIndents`\`\`\`
    - Codename: ${this.client.metadata.codename}
    - Bot version: ${this.client.metadata.version}
    - Autofix version: ${this.client.metadata.autofix}
    - Discord.js: ${version}
    - WebSocket Ping: ${this.client.ws.ping}ms
    - Guild Count: ${this.client.guilds.cache.size}
    - User count: ${this.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)}
    \`\`\``;

    return new EmbedBuilder()
      .setAuthor({
        name: this.client.user!.tag + " Status",
        iconURL: String(this.client.user!.displayAvatarURL({ size: 2048 })),
      })
      .setColor(this.client.color)
      .addFields({ name: "Host info", value: hostInfo }, { name: "Bot info", value: botInfo })
      .setTimestamp();
  }

  async setupInfoChennel() {
    cron.schedule("*/5 * * * * *", async () => {
      const SetupChannel = new Map();
      const prepare = await this.client.db.status.all();
      if (!prepare || prepare.length == 0) return;
      prepare.forEach(async (data) => {
        if (data.value.enable == true) {
          SetupChannel.set(data.value.guild, {
            channel: data.value.channel,
            category: data.value.category,
            statmsg: data.value.statmsg,
          });
        }
      });

      if (!SetupChannel) return;
      const fetched_info = this.infoChannelembed;

      SetupChannel.forEach(async (g) => {
        const fetch_channel =
          g.channel.length !== 0 ? await this.client.channels.fetch(g.channel).catch(() => undefined) : undefined;
        if (!fetch_channel) return;
        const text_channel = fetch_channel! as TextChannel;
        const interval_text = await text_channel.messages!.fetch(g.statmsg).catch(() => undefined);
        interval_text ? await interval_text.edit({ content: ``, embeds: [fetched_info] }) : true;
      });
    });
  }

  async execute() {
    const Client = chalk.hex("#02f75c");
    this.client.logger.setup(ClientDataService.name, "Setting up data for client...");
    this.setupInfoChennel();

    this.client.logger.setup(ClientDataService.name, "Setting up data for client complete!");
  }
}
