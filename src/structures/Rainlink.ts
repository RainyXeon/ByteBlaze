import { Manager } from '../manager.js'
import { Library, Rainlink, RainlinkAdditionalOptions, RainlinkPlugin } from 'rainlink'
import { SpotifyPlugin } from 'rainlink-spotify'
import { NicoPlugin } from 'rainlink-nico'
import { ApplePlugin } from 'rainlink-apple'
import { RainlinkPlugin as YTConverterPlugin } from './YTConverterPlugin.js'
import { ExtendedPlayer } from './extended/ExtendedPlayer.js'
import { DeezerPlugin } from 'rainlink-deezer'

export class RainlinkInit {
  client: Manager
  constructor(client: Manager) {
    this.client = client
  }

  get init(): Rainlink {
    return new Rainlink({
      library: new Library.DiscordJS(this.client),
      nodes: this.client.config.player.NODES,
      plugins: this.plugins,
      options: this.client.config.utilities.AUTOFIX_LAVALINK.enable
        ? { ...this.defaultConfig, ...this.autofixConfig }
        : { ...this.defaultConfig, ...this.nonAutoConfig },
    })
  }

  get defaultConfig(): RainlinkAdditionalOptions {
    return {
      resume: true,
      resumeTimeout: 600,
      defaultSearchEngine: 'youtube',
      structures: {
        player: ExtendedPlayer,
      },
      searchFallback: {
        enable: true,
        engine: 'youtube',
      },
    }
  }

  get nonAutoConfig(): RainlinkAdditionalOptions {
    return {
      retryCount: Infinity,
      retryTimeout: 3000,
    }
  }

  get autofixConfig(): RainlinkAdditionalOptions {
    return {
      retryCount: this.client.config.utilities.AUTOFIX_LAVALINK.retryCount,
      retryTimeout: this.client.config.utilities.AUTOFIX_LAVALINK.retryTimeout,
    }
  }

  get plugins(): RainlinkPlugin[] {
    const defaultPlugins: RainlinkPlugin[] = [
      new DeezerPlugin({
        market: 'us',
      }),
      new NicoPlugin({ searchLimit: 10 }),
      new ApplePlugin({ countryCode: 'us' }),
    ]

    if (this.client.config.player.AVOID_SUSPEND)
      defaultPlugins.push(
        new YTConverterPlugin({
          sources: ['scsearch'],
        })
      )

    if (this.client.config.player.SPOTIFY.enable)
      defaultPlugins.push(
        new SpotifyPlugin({
          clientId: this.client.config.player.SPOTIFY.id,
          clientSecret: this.client.config.player.SPOTIFY.secret,
          playlistPageLimit: 1,
          albumPageLimit: 1,
          searchLimit: 10,
        })
      )

    return defaultPlugins
  }
}
