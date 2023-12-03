import { LavalinkDataType } from "../@types/Lavalink.js";
import axios from "axios";
import MarkdownIt from "markdown-it";
var md = new MarkdownIt();
import fse from "fs-extra";
import { LoggerService } from "../services/LoggerService.js";
import Token from "markdown-it/lib/token.js";

export class getLavalinkServer {
  logger: any;
  constructor() {
    this.logger = new LoggerService().init();
  }

  async execute() {
    if (!fse.existsSync("./.cylane")) {
      const res = await axios.get(
        "https://raw.githubusercontent.com/DarrenOfficial/lavalink-list/master/docs/NoSSL/lavalink-without-ssl.md"
      );

      fse
        .outputFile(".cylane/lavalink_no_ssl.md", res.data)
        .then(() => {
          this.logger.log({
            level: "lavalink",
            message: "New cache has been created!",
          });
        })
        .catch((err: Error) => {
          this.logger.error(err);
        });

      return this.getLavalinkServerInfo(res.data);
    } else if (fse.existsSync("./.cylane")) {
      this.logger.log({
        level: "lavalink",
        message: "Cache found. Now using for speed up",
      });
      const data = await fse.readFile("./.cylane/lavalink_no_ssl.md", {
        encoding: "utf8",
      });
      return this.getLavalinkServerInfo(data);
    }
  }

  getLavalinkServerInfo(data: string) {
    const MdCodeTagFilter: string[] = [];
    const LavalinkCredentailsFilter: string[] = [];
    const FinalData: LavalinkDataType[] = [];

    var result = md.parse(data, "");

    result.filter(async (data: Token) => {
      if (data.tag == "code") {
        MdCodeTagFilter.push(data.content);
      }
    });

    this.parseData(MdCodeTagFilter, LavalinkCredentailsFilter);
    this.commitData(LavalinkCredentailsFilter, FinalData);

    return FinalData;
  }

  parseBoolean(value: string) {
    if (typeof value === "string") {
      value = value.trim().toLowerCase();
    }
    switch (value) {
      case "true":
        return true;
      default:
        return false;
    }
  }

  parseData(MdCodeTagFilter: string[], LavalinkCredentailsFilter: string[]) {
    for (let i = 0; i < MdCodeTagFilter.length; i++) {
      const element = MdCodeTagFilter[i];
      // Phrase data
      const res = element.replace(/\n/g, "");
      const res2 = res.replace(/\s+/g, "");
      const res3 = res2.replace(/Host/g, "");
      const res4 = res3.replace(/Port/g, "");
      const res5 = res4.replace(/Password/g, "");
      const res6 = res5.replace(/Secure/g, "");
      const res7 = res6.replace(/[&\/\\#,+()$~%'"*?<>{}]/g, "");
      LavalinkCredentailsFilter.push(res7);
    }
  }

  commitData(
    LavalinkCredentailsFilter: string[],
    FinalData: LavalinkDataType[]
  ) {
    for (let i = 0; i < LavalinkCredentailsFilter.length; i++) {
      const regexExtract =
        /:(.{0,99999}):([0-9]{0,99999}):(.{0,99999}):(false|true)/;
      const element = LavalinkCredentailsFilter[i];
      const res = regexExtract.exec(element);
      FinalData.push({
        host: res![1],
        port: Number(res![2]),
        pass: res![3],
        secure: this.parseBoolean(res![4]),
        name: `${res![1]}:${Number(res![2])}`,
        online: false,
      });
    }
  }
}

// function parseBoolean(value: string) {
//   if (typeof value === "string") {
//     value = value.trim().toLowerCase();
//   }
//   switch (value) {
//     case "true":
//       return true;
//     default:
//       return false;
//   }
// }

// export default async () => {

// };
