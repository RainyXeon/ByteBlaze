import { KazagumoPlayer, KazagumoQueue } from "kazagumo";

function QueueDuration(player: KazagumoPlayer) {
  const current = player.queue.current!.length ?? 0;
  return player.queue.reduce((acc, cur) => acc + (cur.length || 0), current);
}

function StartQueueDuration(tracks: KazagumoQueue) {
  const current = tracks[0].length ?? 0;
  return tracks.reduce((acc, cur) => acc + (cur.length || 0), current);
}
export { QueueDuration, StartQueueDuration };
