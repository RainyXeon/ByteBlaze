import { EmbedBuilder, Message } from "discord.js";
import { Manager } from "../../../manager.js";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";

// Main code
export default class implements PrefixCommand {
  name = "autoplay";
  description = "Autoplay music (Random play songs)";
  category = "Music";
  usage = "";
  aliases = [];
  accessableby = Accessableby.Member;
  lavalink = true;

  async run(
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) {
    const msg = await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "autoplay_loading")}`
          )
          .setColor(client.color),
      ],
    });

    const player = client.manager.players.get(message.guild!.id);
    if (!player)
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_player")}`
            )
            .setColor(client.color),
        ],
      });
    const { channel } = message.member!.voice;
    if (
      !channel ||
      message.member!.voice.channel !== message.guild!.members.me!.voice.channel
    )
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_voice")}`
            )
            .setColor(client.color),
        ],
      });

    if (player.data.get("autoplay") === true) {
      player.data.set("autoplay", false);
      player.data.set("identifier", null);
      player.data.set("requester", null);
      await player.queue.clear();

      const off = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "autoplay_off")}`)
        .setColor(client.color);

      msg.edit({ content: " ", embeds: [off] });
    } else {
      const identifier = player.queue.current!.identifier;
      const search = `https://www.youtube.com/watch?v=${identifier}&list=RD${identifier}`;
      const res = await player.search(search, { requester: message.author });

      player.data.set("autoplay", true);

      player.data.set("identifier", identifier);

      player.data.set("requester", message.author);

      await player.queue.add(res.tracks[1]);

      const on = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "autoplay_on")}`)
        .setColor(client.color);

      msg.edit({ content: " ", embeds: [on] });
    }
  }
}
