import { Manager } from "../manager.js";
import { LavalinkDataType } from "../@types/Lavalink.js";
import { checkLavalinkServer } from "./checkLavalinkServer.js";
const regex =
  /^(wss?|ws?:\/\/)([0-9]{1,3}(?:\.[0-9]{1,3}){3}|[^\/]+):([0-9]{1,5})$/;

export class autofixLavalink {
  client: Manager;
  constructor(client: Manager) {
    this.client = client;
  }

  async execute() {
    this.client.logger.lavalink("----- Starting autofix lavalink... -----");
    if (this.client.lavalink_list.length == 0) {
      new checkLavalinkServer(this.client);
      return this.fixLavalink();
    } else return this.fixLavalink();
  }

  async fixLavalink() {
    this.checkLavalink();
    await this.removeCurrentLavalink();
    const nodeInfo = await this.applyNewLavalink();

    this.client.lavalink_using.push({
      host: nodeInfo.host,
      port: nodeInfo.port,
      pass: nodeInfo.pass,
      secure: nodeInfo.secure,
      name: `${nodeInfo.host}:${nodeInfo.port}`,
    });
  }

  checkLavalink() {
    if (
      this.client.manager.shoukaku.nodes.size !== 0 &&
      this.client.lavalink_using.length == 0
    ) {
      this.client.manager.shoukaku.nodes.forEach((data, index) => {
        const res = regex.exec(data["url"]);
        this.client.lavalink_using.push({
          host: res![2],
          port: Number(res![3]),
          pass: data["auth"],
          secure: res![1] == "ws://" ? false : true,
          name: index,
        });
      });
    }
  }

  async removeCurrentLavalink() {
    if (
      this.client.manager.shoukaku.nodes.size == 0 &&
      this.client.lavalink_using.length != 0
    ) {
      this.client.used_lavalink.push(this.client.lavalink_using[0]);
      this.client.lavalink_using.splice(0, 1);
    } else if (
      this.client.manager.shoukaku.nodes.size !== 0 &&
      this.client.lavalink_using.length !== 0
    ) {
      this.client.used_lavalink.push(this.client.lavalink_using[0]);
      await this.client.manager.shoukaku.removeNode(
        this.client.lavalink_using[0].name
      );
      this.client.lavalink_using.splice(0, 1);
    }
  }

  async applyNewLavalink() {
    const online_list: LavalinkDataType[] = [];

    this.client.lavalink_list.filter(async (data) => {
      if (data.online == true) return online_list.push(data);
    });

    const nodeInfo =
      online_list[Math.floor(Math.random() * online_list.length)];

    const newNodeInfo = {
      name: `${nodeInfo.host}:${nodeInfo.port}`,
      url: `${nodeInfo.host}:${nodeInfo.port}`,
      auth: nodeInfo.pass,
      secure: nodeInfo.secure,
    };

    await this.client.manager.shoukaku.addNode(newNodeInfo);

    return nodeInfo;
  }
}
