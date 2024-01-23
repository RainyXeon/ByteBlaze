import { Manager } from "../../manager.js";

export default {
  name: "add",
  run: async (client: Manager, json: Record<string, any>, ws: WebSocket) => {
    if (!json.user)
      return ws.send(
        JSON.stringify({ error: "0x115", message: "No user's id provided" }),
      );
    if (!json.guild)
      return ws.send(
        JSON.stringify({ error: "0x120", message: "No guild's id provided" }),
      );
    if (json.tracks && json.query)
      return ws.send(
        JSON.stringify({ error: "0x110", message: "Only 1 - 2 params" }),
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
    });

    if (json.tracks) {
      const res = await player.search(json.tracks[0].uri, {
        requester: Member,
      });
      if (player.playing) for (let track of res.tracks) player.queue.add(track);
      else player.play(res.tracks[0]);
      if (!player.playing) await player.play();

      const song = player.queue.current;

      ws.send(
        JSON.stringify({
          op: "player_start",
          guild: json.guild,
          current: {
            title: song!.title,
            uri: song!.uri,
            length: song!.length,
            thumbnail: song!.thumbnail,
            author: song!.author,
            requester: song!.requester,
          },
        }),
      );

      return;
    } else if (json.query) {
      const res = await player.search(json.query, { requester: Member });
      if (res.type === "PLAYLIST" || res.type === "SEARCH")
        for (let track of res.tracks) player.queue.add(track);

      if (!player.playing && !player.paused) player.play();

      const song = player.queue.current;

      ws.send(
        JSON.stringify({
          op: "player_start",
          guild: json.guild,
          current: {
            title: song!.title,
            uri: song!.uri,
            length: song!.length,
            thumbnail: song!.thumbnail,
            author: song!.author,
            requester: song!.requester,
          },
        }),
      );
    }
  },
};
