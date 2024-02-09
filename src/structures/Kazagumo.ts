import { Kazagumo, KazagumoPlugin, Plugins } from "../lib/main.js";
import { Manager } from "../manager.js";
import { Connectors, ShoukakuOptions } from "shoukaku";

export class KazagumoInit {
  client: Manager;
  constructor(client: Manager) {
    this.client = client;
  }

  get init(): Kazagumo {
    return new Kazagumo(
      {
        defaultSearchEngine: "youtube",
        // MAKE SURE YOU HAVE THIS
        send: (guildId, payload) => {
          const guild = this.client.guilds.cache.get(guildId);
          if (guild) guild.shard.send(payload);
        },
        plugins: this.plugins,
      },
      new Connectors.DiscordJS(this.client),
      this.client.config.lavalink.NODES,
      this.client.config.features.AUTOFIX_LAVALINK.enable
        ? this.autofixConfig
        : this.defaultConfig
    );
  }

  get defaultConfig(): ShoukakuOptions {
    return {
      moveOnDisconnect: true,
      resume: true,
      resumeTimeout: 600,
      reconnectTries: Infinity,
      restTimeout: 3000,
    };
  }

  get autofixConfig(): ShoukakuOptions {
    return {
      reconnectTries:
        this.client.config.features.AUTOFIX_LAVALINK.reconnectTries,
      restTimeout: this.client.config.features.AUTOFIX_LAVALINK.restTimeout,
    };
  }

  get plugins(): KazagumoPlugin[] {
    const defaultPlugins: KazagumoPlugin[] = [
      new Plugins.Deezer(),
      new Plugins.Nico({ searchLimit: 10 }),
      new Plugins.Apple({ countryCode: "us" }),
    ];

    if (this.client.config.lavalink.SPOTIFY.enable)
      defaultPlugins.push(
        new Plugins.Spotify({
          clientId: this.client.config.lavalink.SPOTIFY.id,
          clientSecret: this.client.config.lavalink.SPOTIFY.secret,
          playlistPageLimit: 1,
          albumPageLimit: 1,
          searchLimit: 10,
        })
      );

    return defaultPlugins;
  }
}
