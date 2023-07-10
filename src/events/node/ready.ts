import { Manager } from "../../manager.js";
const regex = /^(wss?|ws?:\/\/)([0-9]{1,3}(?:\.[0-9]{1,3}){3}|[^\/]+):([0-9]{1,5})$/

export default async (client: Manager, name: string) => {
  if (client.used_lavalink.length != 0 && client.used_lavalink[0].name == name) return
    client.fixing_nodes = false

    client.manager.shoukaku.nodes.forEach((data, index) => {
      const res = regex.exec(data["url"])
      client.lavalink_using.push({
          host: res![2],
          port: Number(res![3]),
          pass: data["auth"],
          secure: res![1] == "ws://" ? false : true,
          name: index
      })
    })

    client.logger.info(`Lavalink [${name}] connected.`);
    client.logger.info("Auto ReConnect Collecting player 24/7 data");
    const maindata = await client.db.get(`autoreconnect`)
    if (!maindata) return client.logger.info(`Auto ReConnect found in 0 servers!`);

    client.logger.info(`Auto ReConnect found in ${Object.keys(maindata).length} servers!`);
    if (Object.keys(maindata).length === 0) return

    Object.keys(maindata).forEach(async function(key, index) {
        const data = maindata[key];

        setTimeout(async () => {
            const channel = client.channels.cache.get(data.text)
            const voice = client.channels.cache.get(data.voice)
            if (!channel || !voice) return client.db.delete(`autoreconnect.${key}`)
            const player = await client.manager.createPlayer({
                guildId: data.guild,
                voiceId: data.voice,
                textId: data.text,
                deaf: true
              });
            }
            
        ), index * 5000})
};