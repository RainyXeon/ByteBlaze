import { Manager } from "../../manager.js";

export default async (client: Manager) => {
  client.logger.info("[Lavalink Data Loader]: Setting up data for lavalink...");
  client.logger.info("Auto ReConnect Collecting player 24/7 data");
  const maindata = await client.db.get(`autoreconnect`);
  if (!maindata) {
    client.logger.info(`Auto ReConnect found in 0 servers!`);
    client.logger.info(
      "[Lavalink Data Loader]: Setting up data for lavalink complete!",
    );
    return;
  }

  client.logger.info(
    `Auto ReConnect found in ${Object.keys(maindata).length} servers!`,
  );
  if (Object.keys(maindata).length === 0) return;

  Object.keys(maindata).forEach(async function (key, index) {
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

  client.logger.info(
    "[Lavalink Data Loader]: Setting up data for lavalink complete!",
  );
};
