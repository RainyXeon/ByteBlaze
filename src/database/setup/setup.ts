import { Manager } from "../../manager.js";
import { Setup } from "../schema/Setup.js";
import { EmbedBuilder, TextChannel } from "discord.js";

export class SongRequesterCleanSetup {
  client: Manager;
  constructor(client: Manager) {
    this.client = client;
    this.execute();
  }

  async execute() {
    const guilds = await this.client.db.setup.all();

    for (let data of guilds) {
      const extractData = data.value;
      const player = this.client.rainlink.players.get(extractData.guild);
      if (!extractData.enable) return;
      if (player) return;
      await this.restore(extractData);
    }
  }

  async restore(setupData: Setup) {
    let channel = (await this.client.channels.fetch(setupData.channel).catch(() => undefined)) as TextChannel;
    if (!channel) return;

    let playMsg = await channel.messages.fetch(setupData.playmsg).catch(() => undefined);
    if (!playMsg) return;

    let guildModel = await this.client.db.language.get(`${setupData.guild}`);
    if (!guildModel) {
      guildModel = await this.client.db.language.set(`${setupData.guild}`, this.client.config.bot.LANGUAGE);
    }

    const language = guildModel;

    const queueMsg = `${this.client.getString(language, "setup", "setup_queuemsg")}`;

    const playEmbed = new EmbedBuilder()
      .setColor(this.client.color)
      .setAuthor({
        name: `${this.client.getString(language, "setup", "setup_playembed_author")}`,
      })
      .setImage(`https://cdn.discordapp.com/avatars/${this.client.user!.id}/${this.client.user!.avatar}.jpeg?size=300`);

    return await playMsg
      .edit({
        content: `${queueMsg}`,
        embeds: [playEmbed],
        components: [this.client.diSwitch],
      })
      .catch((e) => {});
  }
}
