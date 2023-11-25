import ms from "pretty-ms";
import { EmbedBuilder, TextChannel, version } from "discord.js";
import { Manager } from "../../manager.js";
import chalk from "chalk";

export class ClientDataService {
  client: Manager;
  constructor(client: Manager) {
    this.client = client;
    this.execute();
  }

  infoChannelembed() {
    return new EmbedBuilder()
      .setTitle(this.client.user!.tag + " Status")
      .addFields([
        {
          name: "Uptime",
          value: `\`\`\`${ms(this.client.uptime!)}\`\`\``,
          inline: true,
        },
        {
          name: "WebSocket Ping",
          value: `\`\`\`${this.client.ws.ping}ms\`\`\``,
          inline: true,
        },
        {
          name: "Memory",
          value: `\`\`\`${(process.memoryUsage().rss / 1024 / 1024).toFixed(
            2
          )} MB RSS\n${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
            2
          )} MB Heap\`\`\``,
          inline: true,
        },
        {
          name: "Guild Count",
          value: `\`\`\`${this.client.guilds.cache.size} guilds\`\`\``,
          inline: true,
        },
        {
          name: "User Count",
          value: `\`\`\`${this.client.users.cache.size} users\`\`\``,
          inline: true,
        },
        {
          name: "Node",
          value: `\`\`\`${process.version} on ${process.platform} ${process.arch}\`\`\``,
          inline: true,
        },
        {
          name: "Cached Data",
          value: `\`\`\`${this.client.users.cache.size} users\n${this.client.emojis.cache.size} emojis\`\`\``,
          inline: true,
        },
        { name: "Discord.js", value: `\`\`\`${version}\`\`\``, inline: true },
      ])
      .setTimestamp()
      .setColor(this.client.color);
  }

  async setupPremium() {
    const users = await this.client.db.premium.all();
    if (users && users.length !== 0)
      users.forEach(async (data) => {
        this.client.premiums.set(data.value.id, data.value);
      });
  }

  async setupInfoChennel() {
    const info = setInterval(async () => {
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
      const fetched_info = this.infoChannelembed();

      SetupChannel.forEach(async (g) => {
        const fetch_channel = await this.client.channels.fetch(g.channel);
        const text_channel = fetch_channel! as TextChannel;
        const interval_text = await text_channel.messages!.fetch(g.statmsg);
        if (!fetch_channel) return;
        await interval_text.edit({ content: ``, embeds: [fetched_info] });
      });
    }, 5000);

    this.client.interval.set("MAIN", info);
  }

  async execute() {
    const Client = chalk.hex("#02f75c");
    const client_mess = Client("Client: ");
    this.client.logger.data_loader(
      client_mess + "Setting up data for client..."
    );

    this.setupPremium();
    this.setupInfoChennel();

    this.client.logger.data_loader(
      client_mess + "Setting up data for client complete!"
    );
  }
}
