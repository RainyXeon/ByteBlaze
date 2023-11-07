import chalk from "chalk";
import { Manager } from "../../manager.js";

export default async (client: Manager) => {
  const lavalink = chalk.hex("#ffc61c");
  const lavalink_mess = lavalink("Lavalink: ");
  client.logger.data_loader(lavalink_mess + `Setting up data for lavalink...`);
  client.logger.data_loader(
    lavalink_mess + `Auto ReConnect Collecting player 24/7 data`
  );
  const maindata = await client.db.autoreconnect.all();

  if (!maindata || maindata.length == 0) {
    client.logger.data_loader(
      lavalink_mess + `Auto ReConnect found in 0 servers!`
    );
    client.logger.data_loader(
      lavalink_mess + `Setting up data for lavalink complete!`
    );
    return;
  }

  client.logger.data_loader(
    lavalink_mess +
      `Auto ReConnect found in ${Object.keys(maindata).length} servers!`
  );
  if (Object.keys(maindata).length === 0) return;

  let retry_interval = setInterval(async () => {
    if (!client.lavalink_using)
      return client.logger.data_loader(
        lavalink_mess + `No lavalink avalible, try again after 3 seconds!`
      );

    clearInterval(retry_interval);

    client.logger.data_loader(
      lavalink_mess + `Lavalink avalible, remove interval and continue setup!`
    );

    await maindata.forEach(async function (data, index) {
      setTimeout(async () => {
        const channel = client.channels.cache.get(data.value.text);
        const voice = client.channels.cache.get(data.value.voice);
        if (!channel || !voice)
          return client.db.autoreconnect.delete(`${data.id}`);
        await client.manager.createPlayer({
          guildId: data.value.guild,
          voiceId: data.value.voice,
          textId: data.value.text,
          deaf: true,
        });
      }),
        index * 5000;
    });

    client.logger.data_loader(
      lavalink_mess +
        `Reconnected to all ${Object.keys(maindata).length} servers!`
    );

    client.logger.data_loader(
      lavalink_mess + `Setting up data for lavalink complete!`
    );
  }, 3000);
};
