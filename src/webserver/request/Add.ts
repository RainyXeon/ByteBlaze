import { Manager } from "../../manager.js";
import { JSON_MESSAGE } from "../../@types/Websocket.js";
import { RequestInterface } from "../RequestInterface.js";
import WebSocket from "ws";

export default class implements RequestInterface {
  name = "add";
  run = async (client: Manager, json: JSON_MESSAGE, ws: WebSocket) => {
    if (!json.user)
      return ws.send(
        JSON.stringify({ error: "0x115", message: "No user's id provided" })
      );
    if (!json.guild)
      return ws.send(
        JSON.stringify({ error: "0x120", message: "No guild's id provided" })
      );
    if (json.tracks && json.query)
      return ws.send(
        JSON.stringify({ error: "0x110", message: "Only 1 - 2 params" })
      );

    const Guild = client.guilds.cache.get(json.guild);
    const Member = Guild!.members.cache.get(json.user);
    const channel =
      Guild!.channels.cache.find((channel) => channel.name === "general") ||
      Guild!.channels.cache.first();

    const player = await client.manager.createPlayer({
      guildId: Guild!.id,
      voiceId: Member!.voice.channel!.id,
      textId: String(channel?.id),
      deaf: true,
      volume: client.config.lavalink.DEFAULT_VOLUME ?? 100,
    });

    if (json.tracks) {
      const res = await player.search(json.tracks[0].uri, {
        requester: Member,
      });
      for (let track of res.tracks) player.queue.add(track);
      if (!player.playing) return await player.play();

      return;
    } else if (json.query) {
      const res = await player.search(json.query, { requester: Member });
      if (res.type === "PLAYLIST" || res.type === "SEARCH")
        for (let track of res.tracks) player.queue.add(track);
      if (!player.playing && !player.paused) return player.play();
    }
  };
}
