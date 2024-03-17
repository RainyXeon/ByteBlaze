import fs from "fs";
import _ from "lodash";
import { config } from "dotenv";
config();

const boolean = ["true", "false", "null", "undefined"];

export class YAMLParseService {
  path: string;
  constructor(path: string) {
    this.path = path;
  }

  execute() {
    const line = this.readline();
    const res_array: string[] = [];

    for (let i = 0; i < line.length; i++) {
      var element = line[i];
      var re = /\${(.*?)\}/;

      if (re.exec(element) !== null || re.exec(element)) {
        const extract = re.exec(element) as string[] | null;
        if (process.env![extract![1]] && boolean.includes(process.env[extract![1]]!.trim().toLowerCase())) {
          const boolean_prase_res: boolean | "null" | undefined = this.parseBoolean(process.env[extract![1]]!);
          res_array.push(_.replace(element, extract![0], String(boolean_prase_res)));
        } else {
          res_array.push(_.replace(element, extract![0], process.env[extract![1]]!));
        }
      } else {
        res_array.push(element);
      }
    }

    return res_array.join("\r\n");
  }

  parseBoolean(value: string) {
    if (typeof value === "string") {
      value = value.trim().toLowerCase();
    }
    switch (value) {
      case "true":
        return true;
      case "null":
        return "null";
      case "undefined":
        return undefined;
      default:
        return false;
    }
  }

  readline() {
    const res_array: string[] = [];

    const res = fs.readFileSync(this.path, "utf-8");

    res.split(/\r?\n/).forEach(function (line) {
      res_array.push(line);
    });

    return res_array;
  }
}
