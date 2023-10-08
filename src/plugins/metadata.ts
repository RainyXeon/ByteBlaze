import { load } from "js-yaml";
import { prase } from "./prase/index.js";
import { config } from "dotenv";
import { Metadata } from "../types/Metadata.js";
config();
let doc;

const yaml_files = prase("./src/metadata.yml");

try {
  const res = load(yaml_files);
  doc = res as Metadata;
} catch (e) {
  console.log(e);
}

export default doc;
