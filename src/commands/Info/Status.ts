import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { Manager } from "../../manager.js";
import os from "os";
import ms from "pretty-ms";
import { stripIndents } from "common-tags";
import { EmbedBuilder, version } from "discord.js";

export default class implements Command {
  public name = ["status"];
  public description = "Shows the status information of the Bot";
  public category = "Info";
  public accessableby = Accessableby.Member;
  public usage = "";
  public aliases = [];
  public lavalink = false;
  public options = [];
  public playerCheck = false;
  public usingInteraction = true;
  public sameVoiceCheck = false;

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();
    const total = os.totalmem() / 1024 / 1024;
    const used = process.memoryUsage().rss / 1024 / 1024;

    const hostInfo = stripIndents`\`\`\`
    - OS: ${os.type()} ${os.release()} (${os.arch()})
    - CPU: ${os.cpus()[0].model}
    - Uptime: ${ms(client.uptime as number)}
    - RAM: ${(total / 1024).toFixed(2)} GB
    - Memory Usage: ${used.toFixed(2)}/${total.toFixed(2)} (MB)
    - Node.js: ${process.version}
    \`\`\``;

    const botInfo = stripIndents`\`\`\`
    - Codename: ${client.metadata.codename}
    - Bot version: ${client.metadata.version}
    - Autofix version: ${client.metadata.autofix}
    - Discord.js: ${version}
    - WebSocket Ping: ${client.ws.ping}ms
    - Response time: ${Date.now() - handler.createdAt}ms
    - Guild Count: ${client.guilds.cache.size}
    - User count: ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)}
    \`\`\``;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: client.user!.username,
        iconURL: String(client.user!.displayAvatarURL({ size: 2048 })),
      })
      .setColor(client.color)
      .addFields(
        { name: "Host Info", value: hostInfo },
        { name: "Bot Info", value: botInfo }
      )
      .setTimestamp();
    await handler.editReply({ embeds: [embed] });
  }
}
