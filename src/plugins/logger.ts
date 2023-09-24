import { createLogger, transports, format, addColors } from "winston";
const { timestamp, prettyPrint, printf } = format;
import moment from "moment";
import chalk from "chalk";

type InfoDataType = {
  message: string;
  level: string;
  timestamp?: string;
};

const timezoned = () => {
  return moment().format("DD-MM-YYYY hh:mm:ss");
};

function filterLog(info: InfoDataType) {
  const pad = 11;
  const info_print = chalk.hex("#00CFF0");
  const debug = chalk.hex("#F5A900");
  const warning = chalk.hex("#FBEC5D");
  const error = chalk.hex("#e12885");
  const online = chalk.hex("#00FF7F");
  const offline = chalk.hex("#E00064");
  const lavalink = chalk.hex("#ffc61c");
  const loader = chalk.hex("#4402f7");
  const data_loader = chalk.hex("#f7f702");

  switch (info.level) {
    case "info":
      return info_print(info.level.toUpperCase().padEnd(pad));
    case "debug":
      return debug(info.level.toUpperCase().padEnd(pad));
    case "warn":
      return warning(info.level.toUpperCase().padEnd(pad));
    case "error":
      return error(info.level.toUpperCase().padEnd(pad));
    case "online":
      return online(info.level.toUpperCase().padEnd(pad));
    case "offline":
      return offline(info.level.toUpperCase().padEnd(pad));
    case "lavalink":
      return lavalink(info.level.toUpperCase().padEnd(pad));
    case "loader":
      return loader(info.level.toUpperCase().padEnd(pad));
    case "data_loader":
      return data_loader(info.level.toUpperCase().padEnd(pad));
  }
}

const time = chalk.hex("#00ddc0");
const message = chalk.hex("#86cecb");

const customFormat = format.combine(
  timestamp({ format: timezoned }),
  printf((info: InfoDataType) => {
    return `${time(info.timestamp)} - ${filterLog(info)} - ${message(
      info.message
    )}`;
  })
);

const fileFormat = format.combine(
  timestamp({ format: timezoned }),
  prettyPrint()
);

const logger = createLogger({
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    online: 3,
    offline: 4,
    lavalink: 5,
    loader: 6,
    data_loader: 7,
    debug: 8,
  },

  transports: [
    new transports.Console({
      level: "debug",
      format: customFormat,
    }),

    new transports.Console({
      level: "error",
      format: fileFormat,
    }),

    new transports.File({
      level: "info",
      filename: "./logs/info.log",
      format: fileFormat,
    }),

    new transports.File({
      level: "error",
      filename: "./logs/error.log",
      format: fileFormat,
    }),

    new transports.File({
      level: "warn",
      filename: "./logs/warn.log",
      format: fileFormat,
    }),
  ],
});

export default logger;
