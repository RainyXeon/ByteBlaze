import { XMLParser } from "fast-xml-parser";
import fs from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { ManifestInterface } from "../@types/Manifest.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

export class ManifestService {
  get data() {
    const data = fs.readFileSync(join(__dirname, "..", "manifest.xml"), "utf-8");

    const parser = new XMLParser();
    let jObj: ManifestInterface = parser.parse(data);

    return jObj;
  }
}
