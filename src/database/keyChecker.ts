import logger from "../plugins/logger.js"
import utils from "node:util";

export function keyChecker(obj: Record<string, any>, sampleConfig: Record<string, any>, dbName: string) {
  const objKey = Object.keys(obj)
  const objReqKey = Object.keys(sampleConfig)

  if (objKey.length > objReqKey.length || objKey.length < objReqKey.length) {
    logger.error(`
      You have more or key on database config prototype, please set [${objReqKey.join(", ")}] only. Example: 
      DATABASE:
        driver: "${dbName}"
        config: ${utils.inspect(sampleConfig)}`)
    process.exit()
  }

  objKey.forEach(data => {
    if (!objReqKey.includes(data)) {
      logger.error(`
      Invalid config, please set [${objReqKey.join(", ")}] only. Example: 
      DATABASE:
        driver: "${dbName}"
        config: ${utils.inspect(sampleConfig)}`)
      process.exit()
    }
  })

  return true
}