import chalk from "chalk";
import { Manager } from "../../manager.js";

export default async (client: Manager) => {
  const lavalink = chalk.hex("#ffc61c");
  const lavalink_mess = lavalink("Lavalink: ");
  client.logger.data_loader(lavalink_mess + `Setting up data for lavalink...`);
  client.logger.data_loader(
    lavalink_mess + `Auto ReConnect Collecting player 24/7 data`,
  );
  const maindata = await client.db.get(`autoreconnect`);

  console.log(maindata)
  if (!maindata) {
    client.logger.data_loader(
      lavalink_mess + `Auto ReConnect found in 0 servers!`,
    );
    client.logger.data_loader(
      lavalink_mess + `Setting up data for lavalink complete!`,
    );
    return;
  }

  client.logger.data_loader(
    lavalink_mess +
      `Auto ReConnect found in ${Object.keys(maindata).length} servers!`,
  );
  if (Object.keys(maindata).length === 0) return;

  let retry_interval = setInterval(async () => {
    if (!client.lavalink_using) return client.logger.data_loader(
      lavalink_mess + `No lavalink avalible, try again after 3 seconds!`,
    );

    clearInterval(retry_interval)

    client.logger.data_loader(
      lavalink_mess + `Lavalink avalible, remove interval and continue setup!`,
    );

    await Object.keys(maindata).forEach(async function (key, index) {
      const data = maindata[key];
  
      setTimeout(async () => {
        const channel = client.channels.cache.get(data.text);
        const voice = client.channels.cache.get(data.voice);
        if (!channel || !voice) return client.db.delete(`autoreconnect.${key}`);
        await client.manager.createPlayer({
          guildId: data.guild,
          voiceId: data.voice,
          textId: data.text,
          deaf: true,
        });
      }),
        index * 5000;
    });
  
    client.logger.data_loader(
      lavalink_mess + `Reconnected to all ${Object.keys(maindata).length} servers!`,
    );
  
    client.logger.data_loader(
      lavalink_mess + `Setting up data for lavalink complete!`,
    );
  }, 3000)
};