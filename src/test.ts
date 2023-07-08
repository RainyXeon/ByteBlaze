import { Client, Message, GatewayIntentBits } from "discord.js";
import { prefix, token } from "./config.json";
import { Kazagumo, Payload, Plugins } from "kazagumo";
import { error } from "console";
// import Nico from './plugin'
const {Connectors} = require("shoukaku");

const client: Client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ]
});

const Nodes = [{
  name: 'Main',
  url: 'narco.buses.rocks:2269',
  auth: "glasshost1984",
  secure: false
}];
const kazagumo = new Kazagumo({
  defaultSearchEngine: "youtube",
  // MAKE SURE YOU HAVE THIS
  send: (guildId, payload) => {
      const guild = client.guilds.cache.get(guildId);
      if (guild) guild.shard.send(payload);
  },
  // plugins: [
  //   new Nico(),
  // ],
}, new Connectors.DiscordJS(client), Nodes);

kazagumo.shoukaku.on('ready', (name) => console.log(`Lavalink ${name}: Ready!`));
kazagumo.shoukaku.on('error', (name, error) => console.error(`Lavalink ${name}: Error Caught,`, error));
kazagumo.shoukaku.on('close', (name, code, reason) => console.warn(`Lavalink ${name}: Closed, Code ${code}, Reason ${reason || 'No reason'}`));
kazagumo.shoukaku.on('disconnect', (name, players, moved) => {
  if (moved) return;
  players.map(player => player.connection.disconnect())
  console.warn(`Lavalink ${name}: Disconnected`);
});


client.once("ready", () => {
  console.log("Bot is ready!");
});


client.on("messageCreate", async (message: Message) => {
  if (message.content.startsWith(`!test`)) {
    const channel = message.member?.voice.channel;

    if (!channel) {
      await message.channel.send("You need to be in a voice channel to use this command!")
      return
    }

    let player = await kazagumo.createPlayer({
      guildId: message.guild!.id ?? '',
      textId: message.channel!.id ?? '',
      voiceId: message.member!.voice.channel!.id ?? ''
    })

    let result = await kazagumo.search('https://www.nicovideo.jp/watch/sm30067009');

    player.play(result.tracks[0])

    console.log(result.tracks)

    await message.channel.send('Done!')
  }
});

client.login(token);