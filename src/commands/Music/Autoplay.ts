import { EmbedBuilder, Message } from "discord.js";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

// Main code
export default class implements Command {
  public name = ["autoplay"];
  public description = "Autoplay music (Random play songs)";
  public category = "Music";
  public accessableby = Accessableby.Member;
  public usage = "";
  public aliases = [];
  public lavalink = true;
  public options = [];
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = true;

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const player = client.manager.players.get(handler.guild!.id);

    if (player!.data.get("autoplay") === true) {
      player!.data.set("autoplay", false);
      player!.data.set("identifier", null);
      player!.data.set("requester", null);
      await player!.queue.clear();

      const off = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(handler.language, "music", "autoplay_off")}`
        )
        .setColor(client.color);

      await handler.editReply({ content: " ", embeds: [off] });
    } else {
      const identifier = player!.queue.current!.identifier;
      const search = `https://www.youtube.com/watch?v=${identifier}&list=RD${identifier}`;
      const res = await player!.search(search, { requester: handler.user });

      player!.data.set("autoplay", true);

      player!.data.set("identifier", identifier);

      player!.data.set("requester", handler.user);

      await player!.queue.add(res.tracks[1]);

      const on = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(handler.language, "music", "autoplay_on")}`
        )
        .setColor(client.color);

      await handler.editReply({ content: " ", embeds: [on] });
    }
  }
}
