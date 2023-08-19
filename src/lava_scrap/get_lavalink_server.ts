import { LavalinkDataType } from "../types/Lavalink.js";
import axios from "axios";
import MarkdownIt from "markdown-it";
var md = new MarkdownIt();
import fse from "fs-extra";
import logger from "../plugins/logger.js";
import Token from "markdown-it/lib/token.js";

function parseBoolean(value: string) {
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

export default async () => {
  let filter_data: string[] = [];
  let filter_data_2: string[] = [];
  let final_data: LavalinkDataType[] = [];

  function getLavalinkServerInfo(data: string) {
    var result = md.parse(data, "");

    result.filter(async (data: Token) => {
      if (data.tag == "code") {
        filter_data.push(data.content);
      }
    });

    for (let i = 0; i < filter_data.length; i++) {
      const element = filter_data[i];
      // Phrase data
      const res = element.replace(/\n/g, "");
      const res2 = res.replace(/\s+/g, "");
      const res3 = res2.replace(/Host/g, "");
      const res4 = res3.replace(/Port/g, "");
      const res5 = res4.replace(/Password/g, "");
      const res6 = res5.replace(/Secure/g, "");
      const res7 = res6.replace(/[&\/\\#,+()$~%'"*?<>{}]/g, "");
      filter_data_2.push(res7);
    }

    for (let i = 0; i < filter_data_2.length; i++) {
      const regex_extract =
        /:(.{0,99999}):([0-9]{0,99999}):(.{0,99999}):(false|true)/;
      const element = filter_data_2[i];
      const res = regex_extract.exec(element);
      final_data.push({
        host: res![1],
        port: Number(res![2]),
        pass: res![3],
        secure: parseBoolean(res![4]),
        name: `${res![1]}:${Number(res![2])}`,
        online: false,
      });
    }

    return final_data;
  }

  if (!fse.existsSync("./.cylane")) {
    const res = await axios.get(
      "https://raw.githubusercontent.com/DarrenOfficial/lavalink-list/master/docs/NoSSL/lavalink-without-ssl.md",
    );

    fse
      .outputFile(".cylane/lavalink_no_ssl.md", res.data)
      .then(() => {
        logger.info("New cache has been created!");
      })
      .catch((err: Error) => {
        logger.error(err);
      });

    return getLavalinkServerInfo(res.data);
  } else if (fse.existsSync("./.cylane")) {
    logger.info("Cache found. Now using for speed up");
    const data = await fse.readFile("./.cylane/lavalink_no_ssl.md", {
      encoding: "utf8",
    });
    return getLavalinkServerInfo(data);
  }
};
