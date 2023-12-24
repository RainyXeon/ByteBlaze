import { Manager } from "../../manager.js";
import { PlaylistTrack } from "../../database/schema/Playlist.js";
import { JSON_MESSAGE } from "../../@types/Websocket.js";
import { RequestInterface } from "../RequestInterface.js";
import WebSocket from "ws";

export default class implements RequestInterface {
  name = "status";
  run = async (client: Manager, json: JSON_MESSAGE, ws: WebSocket) => {
    if (!json.user)
      return ws.send(
        JSON.stringify({ error: "0x115", message: "No user's id provided" })
      );
    if (!json.guild)
      return ws.send(
        JSON.stringify({ error: "0x120", message: "No guild's id provided" })
      );
    const player = client.manager.players.get(json.guild);
    if (!player)
      return ws.send(
        JSON.stringify({ error: "0x100", message: "No player on this guild" })
      );

    const Guild = await client.guilds.fetch(json.guild);
    const Member = await Guild.members.fetch(json.user);

    function playerState() {
      if (player!.state == 5) return false;
      else if (player!.state == 1) return true;
    }

    const song = player.queue.current;
    let webqueue: PlaylistTrack[] = [];

    if (player.queue)
      player.queue.forEach((track) => {
        webqueue.push({
          title: track.title,
          uri: String(track.uri),
          length: track.length,
          thumbnail: track.thumbnail,
          author: track.author,
          requester: track.requester, // Just case can push
        });
      });

    await webqueue.unshift({
      title: song!.title,
      uri: String(song!.uri),
      length: song!.length,
      thumbnail: song!.thumbnail,
      author: song!.author,
      requester: song!.requester,
    });

    return ws.send(
      JSON.stringify({
        op: "status",
        guild: player.guildId,
        loop: player.loop,
        member: !Member.voice.channel || !Member.voice ? false : true,
        pause: player.paused,
        playing: playerState(),
        position: player.shoukaku.position,
        current: song
          ? {
              title: song.title,
              uri: song.uri,
              length: song.length,
              thumbnail: song.thumbnail,
              author: song.author,
              requester: song.requester,
            }
          : null,
        queue: webqueue ? webqueue : null,
      })
    );
  };
}
