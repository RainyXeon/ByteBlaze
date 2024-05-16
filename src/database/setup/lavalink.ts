import { Manager } from "../../manager.js";
import { AutoReconnect } from "../schema/AutoReconnect.js";
import chillout from "chillout";
import { VoiceChannel } from "discord.js";
import { RainlinkLoopMode, RainlinkPlayer } from "../../rainlink/main.js";

export class AutoReconnectLavalinkService {
  client: Manager;
  constructor(client: Manager) {
    this.client = client;
    this.execute();
  }

  async execute() {
    this.client.logger.setup(AutoReconnectLavalinkService.name, `Setting up data for lavalink...`);
    this.client.logger.setup(AutoReconnectLavalinkService.name, `Auto ReConnect Collecting player 24/7 data`);
    const maindata = await this.client.db.autoreconnect.all();

    if (!maindata || maindata.length == 0) {
      this.client.logger.setup(AutoReconnectLavalinkService.name, `Auto ReConnect found in 0 servers!`);
      this.client.logger.setup(AutoReconnectLavalinkService.name, `Setting up data for lavalink complete!`);
      return;
    }

    this.client.logger.setup(
      AutoReconnectLavalinkService.name,
      `Auto ReConnect found in ${Object.keys(maindata).length} servers!`
    );
    if (Object.keys(maindata).length === 0) return;

    let retry_interval = setInterval(async () => {
      if (this.client.lavalinkUsing.length == 0 || this.client.rainlink.nodes.size == 0)
        return this.client.logger.setup(
          AutoReconnectLavalinkService.name,
          `No lavalink avalible, try again after 3 seconds!`
        );

      clearInterval(retry_interval);

      this.client.logger.setup(
        AutoReconnectLavalinkService.name,
        `Lavalink avalible, remove interval and continue setup!`
      );

      chillout.forEach(maindata, async (data: { id: string; value: AutoReconnect }) => {
        setTimeout(async () => this.connectChannel(data));
      });

      this.client.logger.setup(
        AutoReconnectLavalinkService.name,
        `Reconnected to all ${Object.keys(maindata).length} servers!`
      );

      this.client.logger.setup(AutoReconnectLavalinkService.name, `Setting up data for lavalink complete!`);
    }, 3000);
  }

  async connectChannel(data: { id: string; value: AutoReconnect }) {
    const channel = await this.client.channels.fetch(data.value.text).catch(() => undefined);
    const guild = await this.client.guilds.fetch(data.value.guild).catch(() => undefined);
    const voice = (await this.client.channels.fetch(data.value.voice).catch(() => undefined)) as VoiceChannel;
    if (!channel || !voice) {
      this.client.logger.setup(
        AutoReconnectLavalinkService.name,

        `The last voice/text channel that bot joined in guild [${data.value.guild}] is not found, skipping...`
      );
      return this.client.db.autoreconnect.delete(data.value.guild);
    }

    if (!data.value.twentyfourseven && voice.members.filter((m) => !m.user.bot).size == 0) {
      this.client.logger.setup(
        AutoReconnectLavalinkService.name,
        `Guild [${data.value.guild}] have 0 members in last voice that bot joined, skipping...`
      );
      return this.client.db.autoreconnect.delete(data.value.guild);
    }

    const player = await this.client.rainlink.create({
      guildId: data.value.guild,
      voiceId: data.value.voice,
      textId: data.value.text,
      shardId: guild ? guild.shardId : 0,
      deaf: true,
      volume: this.client.config.lavalink.DEFAULT_VOLUME ?? 100,
    });

    if (data.value.current && data.value.current.length !== 0) {
      const search = await player.search(data.value.current, {
        requester: this.client.user,
      });
      if (!search.tracks.length) return;

      if (data.value.queue.length !== 0) await this.queueDataPush(data.value.queue, player);

      if (data.value.previous.length !== 0) await this.previousDataPush(data.value.previous, player);

      if (data.value.config.loop !== "none") player.setLoop(data.value.config.loop as RainlinkLoopMode);
      await player.play(search.tracks[0]);
    }
  }

  async queueDataPush(query: string[], player: RainlinkPlayer) {
    const SongAdd = [];
    let SongLoad = 0;

    for (const data of query) {
      const res = await player.search(data, {
        requester: this.client.user,
      });
      if (res.type == "TRACK") {
        SongAdd.push(res.tracks[0]);
        SongLoad++;
      } else if (res.type == "PLAYLIST") {
        for (let t = 0; t < res.tracks.length; t++) {
          SongAdd.push(res.tracks[t]);
          SongLoad++;
        }
      } else if (res.type == "SEARCH") {
        SongAdd.push(res.tracks[0]);
        SongLoad++;
      }
      if (SongLoad == query.length) {
        player.queue.add(SongAdd);
      }
    }
  }

  async previousDataPush(query: string[], player: RainlinkPlayer) {
    const SongAdd = [];
    let SongLoad = 0;

    for (const data of query) {
      const res = await player.search(data, {
        requester: this.client.user,
      });
      if (res.type == "TRACK") {
        SongAdd.push(res.tracks[0]);
        SongLoad++;
      } else if (res.type == "PLAYLIST") {
        for (let t = 0; t < res.tracks.length; t++) {
          SongAdd.push(res.tracks[t]);
          SongLoad++;
        }
      } else if (res.type == "SEARCH") {
        SongAdd.push(res.tracks[0]);
        SongLoad++;
      }
      if (SongLoad == query.length) {
        player.queue.previous.push(...SongAdd);
      }
    }
  }
}
