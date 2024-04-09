import { RainlinkPlugin as Deezer } from "./Deezer/Plugin.js";
import { RainlinkPlugin as Apple } from "./Apple/Plugin.js";
import { RainlinkPlugin as Nico } from "./Nico/Plugin.js";
import { RainlinkPlugin as Spotify } from "./Spotify/Plugin.js";
import { RainlinkPlugin as PlayerMoved } from "./PlayerMoved/Plugin.js";
import { RainlinkPlugin as SaveSession } from "./SaveSession/Plugin.js";
import { RainlinkPlugin as VoiceReceiver } from "./VoiceReceiver/Plugin.js";
import { RainlinkPlugin as YoutubeConverter } from "./YoutubeConverter/Plugin.js";

/**
 * Import example:
 * @example
 * ```ts
 *
 * const { Rainlink, Plugin, Library } = require('rainlink');
 *
 * const rainlink = new Rainlink(
 *   {
 *     nodes: Nodes,
 *     library: new Library.DiscordJS(client),
 *     plugins: [
 *       new Plugin.Deezer(),
 *       new Plugin.Nico({
 *          searchLimit: 10,
 *       }),
 *       new Plugin.Apple({
 *          countryCode: "us",
 *          imageWidth: 600,
 *          imageHeight: 900,
 *        }),
 *       new Plugin.Spotify({
 *          clientId: "your_spotify_client_id",
 *          clientSecret: "your_spotify_client_secret",
 *          playlistPageLimit: 1,
 *          albumPageLimit: 1,
 *          searchLimit: 20,
 *          searchMarket: "US"
 *        }),
 *       // About save session plugin:
 *       // This plugin still in development stage and only save sessionId not voiceId.
 *       // Be carefull when using
 *       // new Plugin.SaveSession(),
 *       new Plugin.PlayerMoved(client),
 *       // About voice receiver plugin:
 *       // This plugin only works with node use Nodelink2 driver.
 *       new Plugin.VoiceReceiver()
 *       // The order of the source you want to search replaces YouTube, for example: scsearch, spsearch.
 *       // The more sources added, the slower the performance will be.
 *       new Plugin.YoutubeConverter({
 *          sources: ["scsearch"]
 *       })
 *     ],
 *   },
 * );
 *
 * // Example search for deezer
 * rainlink.search(`https://www.deezer.com/us/playlist/53362031`); // track, album, playlist
 * // search track using deezer (avalible: "spotify", "apple", "deezer", "nicovideo", "youtube", "youtubeMusic", "soundCloud", ...depend on lavalink)
 * rainlink.search('mirror heart', { engine: 'deezer' });
 * ```
 */

export default {
  Deezer,
  Apple,
  Nico,
  Spotify,
  PlayerMoved,
  SaveSession,
  VoiceReceiver,
};
