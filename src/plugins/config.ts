import { load } from "js-yaml";
import { prase } from "./prase/index.js";
let doc: any;

const yaml_files = prase("./application.yml");

try {
  const res = load(yaml_files);
  doc = res;
} catch (e) {
  console.log(e);
}

export default doc;
