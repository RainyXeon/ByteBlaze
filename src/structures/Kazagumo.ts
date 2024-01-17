import { Kazagumo, Plugins } from "../lib/main.js";
import { Manager } from "../manager.js";
import { Connectors } from "shoukaku";

export class KazagumoInit {
  client: Manager;
  constructor(client: Manager) {
    this.client = client;
  }

  get init() {
    return new Kazagumo(
      {
        defaultSearchEngine: "youtube",
        // MAKE SURE YOU HAVE THIS
        send: (guildId, payload) => {
          const guild = this.client.guilds.cache.get(guildId);
          if (guild) guild.shard.send(payload);
        },
        plugins: this.client.config.lavalink.SPOTIFY.enable
          ? [
              new Plugins.Spotify({
                clientId: this.client.config.lavalink.SPOTIFY.id,
                clientSecret: this.client.config.lavalink.SPOTIFY.secret,
                playlistPageLimit: 1, // optional ( 100 tracks per page )
                albumPageLimit: 1, // optional ( 50 tracks per page )
                searchLimit: 10, // optional ( track search limit. Max 50 )
              }),
              new Plugins.Deezer(),
              new Plugins.Nico({ searchLimit: 10 }),
              new Plugins.PlayerMoved(this.client),
              new Plugins.Apple({ countryCode: "us" }),
            ]
          : [
              new Plugins.Deezer(),
              new Plugins.Nico({ searchLimit: 10 }),
              new Plugins.PlayerMoved(this.client),
              new Plugins.Apple({ countryCode: "us" }),
            ],
      },
      new Connectors.DiscordJS(this.client),
      this.client.config.lavalink.NODES,
      this.client.config.features.AUTOFIX_LAVALINK.enable
        ? {
            reconnectTries:
              this.client.config.features.AUTOFIX_LAVALINK.reconnectTries,
            restTimeout:
              this.client.config.features.AUTOFIX_LAVALINK.restTimeout,
          }
        : this.client.config.lavalink.SHOUKAKU_OPTIONS
    );
  }
}
