import ms from "pretty-ms";
import { EmbedBuilder, TextChannel, version } from "discord.js";
import { Manager } from "../../manager.js";

export default async (client: Manager) => {
  client.logger.info("[Client Data Loader]: Setting up data for client...");
  const users = await client.db.get("premium");
  if (users)
    Object.keys(users).forEach(async (key, index) => {
      client.premiums.set(users[key].id, users[key]);
    });

  const info = setInterval(async () => {
    const SetupChannel = new Map();
    const prepare = await client.db.get(`status`);
    if (!prepare) return;
    Object.keys(prepare).forEach(async (key, index) => {
      if (prepare[key].enable == true) {
        SetupChannel.set(prepare[key].guild, {
          channel: prepare[key].channel,
          category: prepare[key].category,
          statmsg: prepare[key].statmsg,
        });
      }
    });

    if (!SetupChannel) return;
    const fetched_info = new EmbedBuilder()
      .setTitle(client.user!.tag + " Status")
      .addFields([
        {
          name: "Uptime",
          value: `\`\`\`${ms(client.uptime!)}\`\`\``,
          inline: true,
        },
        {
          name: "WebSocket Ping",
          value: `\`\`\`${client.ws.ping}ms\`\`\``,
          inline: true,
        },
        {
          name: "Memory",
          value: `\`\`\`${(process.memoryUsage().rss / 1024 / 1024).toFixed(
            2,
          )} MB RSS\n${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
            2,
          )} MB Heap\`\`\``,
          inline: true,
        },
        {
          name: "Guild Count",
          value: `\`\`\`${client.guilds.cache.size} guilds\`\`\``,
          inline: true,
        },
        {
          name: "User Count",
          value: `\`\`\`${client.users.cache.size} users\`\`\``,
          inline: true,
        },
        {
          name: "Node",
          value: `\`\`\`${process.version} on ${process.platform} ${process.arch}\`\`\``,
          inline: true,
        },
        {
          name: "Cached Data",
          value: `\`\`\`${client.users.cache.size} users\n${client.emojis.cache.size} emojis\`\`\``,
          inline: true,
        },
        { name: "Discord.js", value: `\`\`\`${version}\`\`\``, inline: true },
      ])
      .setTimestamp()
      .setColor(client.color);

    SetupChannel.forEach(async (g) => {
      const fetch_channel = await client.channels.fetch(g.channel);
      const text_channel = fetch_channel! as TextChannel;
      const interval_text = await text_channel.messages!.fetch(g.statmsg);
      if (!fetch_channel) return;
      await interval_text.edit({ content: ``, embeds: [fetched_info] });
    });
  }, 5000);

  client.interval.set("MAIN", info);

  client.logger.info(
    "[Client Data Loader]: Setting up data for client complete!",
  );
};
