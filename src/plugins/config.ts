import { load } from 'js-yaml'
import fs  from 'fs'
import { prase } from "./prase"

const file = fs.readFileSync('./application.yml', 'utf8')
const yaml_files = prase(file)
let doc

try {
  const res = load(yaml_files);
  doc = res
} catch (e) {
  console.log(e);
}

module.exports = doc