import { createLogger, transports, format, Logger } from "winston";
const { timestamp, prettyPrint, printf } = format;
import chalk from "chalk";
import util from "node:util";
import { Manager } from "../manager.js";
import { EmbedBuilder, TextChannel } from "discord.js";

type InfoDataType = {
  message: string;
  level: string;
  timestamp?: string;
};

export class LoggerService {
  private preLog: Logger;
  private padding = 28;
  constructor(private client: Manager) {
    this.preLog = createLogger({
      levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
        unhandled: 4,
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

  public info(className: string, msg: string) {
    return this.preLog.log({
      level: "info",
      message: `${className.padEnd(this.padding)} | ${msg}`,
    });
  }

  public debug(className: string, msg: string) {
    this.preLog.log({
      level: "debug",
      message: `${className.padEnd(this.padding)} | ${msg}`,
    });
    return;
  }

  public warn(className: string, msg: string) {
    this.preLog.log({
      level: "warn",
      message: `${className.padEnd(this.padding)} | ${msg}`,
    });
    this.sendDiscord("warning", msg, className);
    return;
  }

  public error(className: string, msg: unknown) {
    this.preLog.log({
      level: "error",
      message: `${className.padEnd(this.padding)} | ${util.inspect(msg)}`,
    });
    this.sendDiscord("error", util.inspect(msg), className);
    return;
  }

  public unhandled(className: string, msg: unknown) {
    this.preLog.log({
      level: "unhandled",
      message: `${className.padEnd(this.padding)} | ${util.inspect(msg)}`,
    });
    this.sendDiscord("unhandled", util.inspect(msg), className);
    return;
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
      case "unhandled":
        return chalk.hex("#ff0000")(info.level.toUpperCase().padEnd(pad));
    }
  }

  private get consoleFormat() {
    const colored = chalk.hex("#86cecb")("|");
    const timeStamp = (info: InfoDataType) => chalk.hex("#00ddc0")(info.timestamp);
    const msg = (info: InfoDataType) => chalk.hex("#86cecb")(info.message);
    return format.combine(
      timestamp(),
      printf((info: InfoDataType) => {
        return `${timeStamp(info)} ${colored} ${this.filter(info)} ${colored} ${msg(info)}`;
      })
    );
  }

  private get fileFormat() {
    return format.combine(timestamp(), prettyPrint());
  }

  private async sendDiscord(type: string, message: string, className: string) {
    const channelId = this.client.config.utilities.LOG_CHANNEL;
    if (!channelId || channelId.length == 0) return;
    try {
      const channel = (await this.client.channels
        .fetch(channelId)
        .catch(() => undefined)) as TextChannel;
      if (!channel || !channel.isTextBased()) return;
      let embed = null;
      if (message.length > 4096) {
        embed = new EmbedBuilder()
          .setDescription("Logs too long to display! please check your host!")
          .setTitle(`${type} from ${className}`)
          .setColor(this.client.color);
      } else {
        embed = new EmbedBuilder()
          .setDescription(message)
          .setTitle(`${type} from ${className}`)
          .setColor(this.client.color);
      }

      await channel.messages.channel.send({ embeds: [embed] });
    } catch (err) {}
  }
}
