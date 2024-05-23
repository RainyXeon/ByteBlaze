import { convertTime } from "./ConvertTime.js";

export function formatDuration(duration: number | undefined) {
  if (typeof duration === "undefined") return "00:00";
  if (duration > 3600000000) return "Live";
  return convertTime(duration);
}
