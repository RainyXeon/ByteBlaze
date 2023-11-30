import chalk from "chalk";
import { Manager } from "../../manager.js";
import { AutoReconnect } from "../schema/AutoReconnect.js";
import chillout from "chillout";

export class AutoReconnectLavalinkService {
  client: Manager;
  constructor(client: Manager) {
    this.client = client;
    this.execute();
  }

  async execute() {
    const lavalink = chalk.hex("#ffc61c");
    const lavalink_mess = lavalink("Lavalink: ");
    this.client.logger.data_loader(
      lavalink_mess + `Setting up data for lavalink...`
    );
    this.client.logger.data_loader(
      lavalink_mess + `Auto ReConnect Collecting player 24/7 data`
    );
    const maindata = await this.client.db.autoreconnect.all();

    if (!maindata || maindata.length == 0) {
      this.client.logger.data_loader(
        lavalink_mess + `Auto ReConnect found in 0 servers!`
      );
      this.client.logger.data_loader(
        lavalink_mess + `Setting up data for lavalink complete!`
      );
      return;
    }

    this.client.logger.data_loader(
      lavalink_mess +
        `Auto ReConnect found in ${Object.keys(maindata).length} servers!`
    );
    if (Object.keys(maindata).length === 0) return;

    let retry_interval = setInterval(async () => {
      if (!this.client.lavalink_using)
        return this.client.logger.data_loader(
          lavalink_mess + `No lavalink avalible, try again after 3 seconds!`
        );

      clearInterval(retry_interval);

      this.client.logger.data_loader(
        lavalink_mess + `Lavalink avalible, remove interval and continue setup!`
      );

      chillout.forEach(
        maindata,
        async (data: { id: string; value: AutoReconnect }) => {
          setTimeout(async () => this.connectChannel(data));
        }
      );

      this.client.logger.data_loader(
        lavalink_mess +
          `Reconnected to all ${Object.keys(maindata).length} servers!`
      );

      this.client.logger.data_loader(
        lavalink_mess + `Setting up data for lavalink complete!`
      );
    }, 3000);
  }

  async connectChannel(data: { id: string; value: AutoReconnect }) {
    const channel = this.client.channels.cache.get(data.value.text);
    const voice = this.client.channels.cache.get(data.value.voice);
    if (!channel || !voice)
      return this.client.db.autoreconnect.delete(`${data.id}`);
    await this.client.manager.createPlayer({
      guildId: data.value.guild,
      voiceId: data.value.voice,
      textId: data.value.text,
      deaf: true,
    });
  }
}
