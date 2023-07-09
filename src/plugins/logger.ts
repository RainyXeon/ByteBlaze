import { createLogger, transports, format, addColors } from 'winston';
const { combine, timestamp, prettyPrint, printf, colorize } = format;
import moment from "moment";
import chalk from "chalk"

const timezoned = () => {
    return moment().format("DD-MM-YYYY hh:mm:ss")
}

function filterLog(info: any) {
  const info_print = chalk.hex('#00CFF0')
  const debug = chalk.hex("#F5A900")
  const warning = chalk.hex("#FBEC5D")
  const error = chalk.hex("#e12885")
  const online = chalk.hex("#00FF7F")
  const offline = chalk.hex("#E00064")
  

  switch (info.level) {
    case "info":
      return info_print(info.level.toUpperCase().padEnd(7))
    case "debug":
      return debug(info.level.toUpperCase().padEnd(7))
    case "warn":
      return warning(info.level.toUpperCase().padEnd(7))
    case "error":
      return error(info.level.toUpperCase().padEnd(7))
    case "online":
      return online(info.level.toUpperCase().padEnd(7))
    case "offline":
      return offline(info.level.toUpperCase().padEnd(7))
  }
}

const time = chalk.hex('#00ddc0');
const message = chalk.hex("#86cecb")


const customFormat = format.combine(timestamp({ format: timezoned }), printf((info: any) => {
	return `${time(info.timestamp)} - ${filterLog(info)} - ${message(info.message)}`
}))

const fileFormat = format.combine(
  timestamp({ format: timezoned }),
  prettyPrint(),
)

const logger = createLogger({
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    online: 3,
    offline: 4,
    debug: 5
  },

	transports: [
    new transports.Console({
      level: 'debug',
      format: customFormat,
    }),

    new transports.Console({
      level: 'error',
      format: fileFormat,
    }),

    new transports.File({
      level: 'info',
      filename: './logs/info.log',
      format: fileFormat
    }),

    new transports.File({
      level: 'error',
      filename: './logs/error.log',
      format: fileFormat
    }),

    new transports.File({
      level: 'warn',
      filename: './logs/warn.log',
      format: fileFormat
    }),
    new transports.File({
      level: 'debug',
      filename: './logs/debug.log',
      format: fileFormat
    }),
	]
});

export default logger;