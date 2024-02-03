import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { Manager } from "../../manager.js";
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

    const botInfo = stripIndents`\`\`\`
    - Codename        | ${client.metadata.codename}
    - Bot version     | ${client.metadata.version}
    - Autofix version | ${client.metadata.autofix}
    - Discord.js      | ${version}
    - WebSocket Ping  | ${client.ws.ping}ms
    - Response time   | ${Date.now() - handler.createdAt}ms
    - Guild Count     | ${client.guilds.cache.size}
    - User count      | ${client.guilds.cache.reduce(
      (a, b) => a + b.memberCount,
      0
    )}
    - Node.js         | ${process.version}
    \`\`\``;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: client.user!.username,
        iconURL: String(client.user!.displayAvatarURL({ size: 2048 })),
      })
      .setColor(client.color)
      .addFields({ name: "Bot Info", value: botInfo })
      .setTimestamp();
    await handler.editReply({ embeds: [embed] });
  }
}
