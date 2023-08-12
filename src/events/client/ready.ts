import { EmbedBuilder, version, TextChannel } from "discord.js";
import { Manager } from "../../manager.js";
import ms from "pretty-ms";
import { Deploy } from "../../plugins/autoDeploy.js";

export default async (client: Manager) => {
  client.logger.info(`Logged in ${client.user!.tag}`);

  // Auto deploy
  Deploy(client);

  const users = await client.db.get("premium");
  if (users)
    Object.keys(users).forEach(async (key, index) => {
      client.premiums.set(users[key].id, users[key]);
    });

  let guilds = client.guilds.cache.size;
  let members = client.guilds.cache.reduce((a, b) => a + b.memberCount, 0);
  let channels = client.channels.cache.size;

  const activities = [
    `with ${guilds} servers! | /music radio`,
    `with ${members} users! | /music play`,
    `with ${channels} users! | /filter nightcore`,
  ];

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

  setInterval(() => {
    client.user!.setPresence({
      activities: [
        {
          name: `${activities[Math.floor(Math.random() * activities.length)]}`,
          type: 2,
        },
      ],
      status: "online",
    });
  }, 15000);
};
