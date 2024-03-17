import { createLogger, transports, format, Logger } from "winston";
const { timestamp, prettyPrint, printf } = format;
import { fileURLToPath } from "url";
import chalk from "chalk";
import util from "node:util";

type InfoDataType = {
  message: string;
  level: string;
  timestamp?: string;
};

export class LoggerService {
  private preLog: Logger;
  private padding = 22;
  private color = "#02faf0";
  constructor() {
    this.preLog = createLogger({
      levels: {
        error: 0,
        warn: 1,
        info: 2,
        websocket: 3,
        lavalink: 4,
        loader: 5,
        setup: 6,
        deploy: 7,
        debug: 8,
        unhandled: 9,
      },

      transports: [
        new transports.Console({
          level: "unhandled",
          format: this.consoleFormat,
        }),

        new transports.File({
          level: "unhandled",
          filename: "./logs/byteblaze.log",
          format: this.fileFormat,
        }),
      ],
    });
  }

  public info(file: string, msg: string) {
    return this.preLog.log({
      level: "info",
      message: `${chalk.hex(this.color)(
        fileURLToPath(file)
          .replace(/^.*[\\\/]/, "")
          .padEnd(this.padding)
      )} - ${msg}`,
    });
  }

  public debug(file: string, msg: string) {
    return this.preLog.log({
      level: "debug",
      message: `${chalk.hex(this.color)(
        fileURLToPath(file)
          .replace(/^.*[\\\/]/, "")
          .padEnd(this.padding)
      )} - ${msg}`,
    });
  }

  public warn(file: string, msg: string) {
    return this.preLog.log({
      level: "warn",
      message: `${chalk.hex(this.color)(
        fileURLToPath(file)
          .replace(/^.*[\\\/]/, "")
          .padEnd(this.padding)
      )} - ${msg}`,
    });
  }

  public error(file: string, msg: unknown) {
    return this.preLog.log({
      level: "error",
      message: `${chalk.hex(this.color)(
        fileURLToPath(file)
          .replace(/^.*[\\\/]/, "")
          .padEnd(this.padding)
      )} - ${util.inspect(msg)}`,
    });
  }

  public lavalink(file: string, msg: string) {
    return this.preLog.log({
      level: "lavalink",
      message: `${chalk.hex(this.color)(
        fileURLToPath(file)
          .replace(/^.*[\\\/]/, "")
          .padEnd(this.padding)
      )} - ${msg}`,
    });
  }

  public loader(file: string, msg: string) {
    return this.preLog.log({
      level: "loader",
      message: `${chalk.hex(this.color)(
        fileURLToPath(file)
          .replace(/^.*[\\\/]/, "")
          .padEnd(this.padding)
      )} - ${msg}`,
    });
  }

  public setup(file: string, msg: string) {
    return this.preLog.log({
      level: "setup",
      message: `${chalk.hex(this.color)(
        fileURLToPath(file)
          .replace(/^.*[\\\/]/, "")
          .padEnd(this.padding)
      )} - ${msg}`,
    });
  }

  public websocket(file: string, msg: string) {
    return this.preLog.log({
      level: "websocket",
      message: `${chalk.hex(this.color)(
        fileURLToPath(file)
          .replace(/^.*[\\\/]/, "")
          .padEnd(this.padding)
      )} - ${msg}`,
    });
  }

  public deploy(file: string, msg: string) {
    return this.preLog.log({
      level: "deploy",
      message: `${chalk.hex(this.color)(
        fileURLToPath(file)
          .replace(/^.*[\\\/]/, "")
          .padEnd(this.padding)
      )} - ${msg}`,
    });
  }

  public unhandled(file: string, msg: unknown) {
    return this.preLog.log({
      level: "unhandled",
      message: `${chalk.hex(this.color)(
        fileURLToPath(file)
          .replace(/^.*[\\\/]/, "")
          .padEnd(this.padding)
      )} - ${util.inspect(msg)}`,
    });
  }

  private filter(info: InfoDataType) {
    const pad = 9;

    switch (info.level) {
      case "info":
        return chalk.hex("#00CFF0")(info.level.toUpperCase().padEnd(pad));
      case "debug":
        return chalk.hex("#F5A900")(info.level.toUpperCase().padEnd(pad));
      case "warn":
        return chalk.hex("#FBEC5D")(info.level.toUpperCase().padEnd(pad));
      case "error":
        return chalk.hex("#e12885")(info.level.toUpperCase().padEnd(pad));
      case "lavalink":
        return chalk.hex("#ffc61c")(info.level.toUpperCase().padEnd(pad));
      case "loader":
        return chalk.hex("#4402f7")(info.level.toUpperCase().padEnd(pad));
      case "setup":
        return chalk.hex("#f7f702")(info.level.toUpperCase().padEnd(pad));
      case "websocket":
        return chalk.hex("#00D100")(info.level.toUpperCase().padEnd(pad));
      case "deploy":
        return chalk.hex("#7289da")(info.level.toUpperCase().padEnd(pad));
      case "unhandled":
        return chalk.hex("#ff0000")(info.level.toUpperCase().padEnd(pad));
    }
  }

  private get consoleFormat() {
    return format.combine(
      timestamp(),
      printf((info: InfoDataType) => {
        return `${chalk.hex("#00ddc0")(info.timestamp)} - ${this.filter(info)} - ${chalk.hex("#86cecb")(info.message)}`;
      })
    );
  }

  private get fileFormat() {
    return format.combine(timestamp(), prettyPrint());
  }
}
