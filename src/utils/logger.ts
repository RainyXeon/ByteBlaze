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
  return moment().format("DD-MM-YYYY hh:mm:ss:SSS");
};

function filterLog(info: InfoDataType) {
  const pad = 11;

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
  }
}

const customFormat = format.combine(
  timestamp({ format: timezoned }),
  printf((info: InfoDataType) => {
    return `${chalk.hex("#00ddc0")(info.timestamp)} - ${filterLog(
      info
    )} - ${chalk.hex("#86cecb")(info.message)}`;
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
    websocket: 3,
    lavalink: 4,
    loader: 5,
    data_loader: 6,
    debug: 7,
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
  ],
});

export default logger;
