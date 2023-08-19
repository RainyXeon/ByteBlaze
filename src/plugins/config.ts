import { load } from "js-yaml";
import { prase } from "./prase/index.js";
let doc;

const yaml_files = prase("./application.yml");

try {
  const res = load(yaml_files);
  doc = res as Record<string, any>;
} catch (e) {
  console.log(e);
}

export default doc;
