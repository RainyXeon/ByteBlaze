import { Manager } from "../manager.js";
import { KeyCheckerEnum } from "../@types/KeyChecker.js";
import { LoggerService } from "../services/LoggerService.js";
import utils from "node:util";

export class keyChecker {
  obj: Record<string, any>;
  sampleConfig: Record<string, any>;
  dbName: string;
  constructor(
    private client: Manager,
    obj: Record<string, any>,
    sampleConfig: Record<string, any>,
    dbName: string
  ) {
    this.dbName = dbName;
    this.obj = obj;
    this.sampleConfig = sampleConfig;
    this.execute();
  }

  execute() {
    const logger = new LoggerService(this.client, this.client.clientIndex);
    const objReqKey = Object.keys(this.sampleConfig);
    const res = this.checkEngine();

    if (res == KeyCheckerEnum.Pass) return true;

    logger.error(
      import.meta.url,
      `
      Invalid config [${res}], please set [${objReqKey.join(", ")}] only. Example: 
      DATABASE:
        driver: "${this.dbName}"
        config: ${utils.inspect(this.sampleConfig)}`
    );
    process.exit();
  }

  checkEngine() {
    const objKey = Object.keys(this.obj);
    const objReqKey = Object.keys(this.sampleConfig);
    const checkedKey: string[] = [];

    if (objReqKey.length > objKey.length) return KeyCheckerEnum.MissingKey;
    if (objReqKey.length < objKey.length) return KeyCheckerEnum.TooMuchKey;

    try {
      for (let i = 0; i < objKey.length; i++) {
        if (checkedKey.includes(objKey[i])) return KeyCheckerEnum.DuplicateKey;
        if (!(objKey[i] in this.sampleConfig)) return KeyCheckerEnum.InvalidKey;
        checkedKey.push(objKey[i]);
      }
    } finally {
      checkedKey.length = 0;
      return KeyCheckerEnum.Pass;
    }
  }
}
