import { createLogger, transports, format, addColors } from "winston";
const { timestamp, prettyPrint, printf } = format;
import moment from "moment";
import chalk from "chalk";

type InfoDataType = {
  message: string;
  level: string;
  timestamp?: string;
};

export class LoggerService {
  init() {
    return createLogger({
      levels: {
        error: 0,
        warn: 1,
        info: 2,
        websocket: 3,
        lavalink: 4,
        loader: 5,
        data_loader: 6,
        deploy_slash: 7,
        debug: 8,
      },

      transports: [
        new transports.Console({
          level: "debug",
          format: this.consoleFormat,
        }),

        new transports.Console({
          level: "error",
          format: this.fileFormat,
        }),

        new transports.File({
          level: "info",
          filename: "./logs/info.log",
          format: this.fileFormat,
        }),

        new transports.File({
          level: "error",
          filename: "./logs/error.log",
          format: this.fileFormat,
        }),
      ],
    });
  }

  filter(info: InfoDataType) {
    const pad = 12;

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
      case "data_loader":
        return chalk.hex("#f7f702")(info.level.toUpperCase().padEnd(pad));
      case "websocket":
        return chalk.hex("#00D100")(info.level.toUpperCase().padEnd(pad));
      case "deploy_slash":
        return chalk.hex("#7289da")(info.level.toUpperCase().padEnd(pad));
    }
  }

  timezone() {
    return moment().format("DD-MM-YYYY hh:mm:ss:SSS");
  }

  get consoleFormat() {
    return format.combine(
      timestamp({ format: this.timezone }),
      printf((info: InfoDataType) => {
        return `${chalk.hex("#00ddc0")(info.timestamp)} - ${this.filter(
          info
        )} - ${chalk.hex("#86cecb")(info.message)}`;
      })
    );
  }

  get fileFormat() {
    return format.combine(timestamp({ format: this.timezone }), prettyPrint());
  }
}
