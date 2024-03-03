export class ConvertTime {
  parse(duration: number) {
    let seconds: string | number = parseInt(`${(duration / 1000) % 60}`);
    let minutes: string | number = parseInt(`${(duration / (1000 * 60)) % 60}`);
    let hours: string | number = parseInt(`${(duration / (1000 * 60 * 60)) % 24}`);

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    if (duration < 3600000) {
      return minutes + ":" + seconds;
    } else {
      return hours + ":" + minutes + ":" + seconds;
    }
  }
}
