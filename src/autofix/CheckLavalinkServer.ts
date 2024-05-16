import { Manager } from "../manager.js";
import { Headers } from "../@types/Lavalink.js";
import { GetLavalinkServer } from "./GetLavalinkServer.js";
import Websocket from "ws";

export class CheckLavalinkServer {
  client: Manager;
  constructor(client: Manager, isLogEnable: boolean = true) {
    this.client = client;
    this.execute(isLogEnable);
  }

  async execute(isLogEnable: boolean) {
    if (isLogEnable)
      this.client.logger.lavalink(
        CheckLavalinkServer.name,
        "Running check lavalink server from [https://lavalink.darrennathanael.com/] source"
      );

    const getLavalinkServerClass = new GetLavalinkServer();

    const lavalink_data = await getLavalinkServerClass.execute();

    if (this.client.lavalinkList.length !== 0) this.client.lavalinkList.length = 0;

    for (let i = 0; i < lavalink_data!.length; i++) {
      const config = lavalink_data![i];
      let headers = {
        "Client-Name": "rainlink/1.0.0 (https://github.com/RainyXeon/Rainlink)",
        "User-Agent": "rainlink/1.0.0 (https://github.com/RainyXeon/Rainlink)",
        Authorization: config.pass,
        "User-Id": "977148321682575410",
        "Resume-Key": "rainlink@1.0.0(https://github.com/RainyXeon/Rainlink)",
      };

      const url = `ws://${config.host}:${config.port}/v4/websocket`;

      this.checkServerStatus(url, headers)
        .then(() => {
          this.client.lavalinkList.push({
            host: config.host,
            port: config.port,
            pass: config.pass,
            secure: config.secure,
            name: `${config.host}:${config.port}`,
            online: true,
          });
        })
        .catch(() => {
          this.client.lavalinkList.push({
            host: config.host,
            port: config.port,
            pass: config.pass,
            secure: config.secure,
            name: `${config.host}:${config.port}`,
            online: false,
          });
        });
    }
  }

  checkServerStatus(url: string, headers: Headers) {
    return new Promise((resolve, reject) => {
      const ws = new Websocket(url, { headers });
      ws.onopen = () => {
        resolve(ws.readyState);
        ws.close();
      };
      ws.onerror = (e) => {
        reject(e);
      };
    });
  }
}
