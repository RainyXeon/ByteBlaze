import { ConvertTime } from "./ConvertTime.js";

export class FormatDuration {
  parse(duration: number | undefined) {
    if (typeof duration === "undefined") return "00:00";
    if (duration > 3600000000) return "Live";
    return new ConvertTime().parse(duration);
  }
}
