import readline from "./readline.js";
import _ from "lodash";
import { config } from "dotenv";
config();

const boolean = ["true", "false", "null", "undefined"];

function parseBoolean(value: string) {
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

export function prase(path: string) {
  const line = readline(path);
  const res_array: string[] = [];

  for (let i = 0; i < line.length; i++) {
    var element = line[i];
    var re = /\${(.*?)\}/;

    if (re.exec(element) !== null || re.exec(element)) {
      const extract = re.exec(element) as string[] | null;
      if (
        process.env![extract![1]] &&
        boolean.includes(process.env[extract![1]]!.trim().toLowerCase())
      ) {
        const boolean_prase_res: boolean | "null" | undefined = parseBoolean(
          process.env[extract![1]]!
        );
        res_array.push(
          _.replace(element, extract![0], String(boolean_prase_res))
        );
      } else {
        res_array.push(
          _.replace(element, extract![0], process.env[extract![1]]!)
        );
      }
    } else {
      res_array.push(element);
    }
  }

  return res_array.join("\r\n");
}
