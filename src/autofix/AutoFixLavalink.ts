import { Manager } from "../manager.js";
import { LavalinkDataType } from "../@types/Lavalink.js";
import { CheckLavalinkServer } from "./CheckLavalinkServer.js";
import chalk from "chalk";
const regex = /^(wss?|ws?:\/\/)([0-9]{1,3}(?:\.[0-9]{1,3}){3}|[^\/]+):([0-9]{1,5})$/;

export class AutoFixLavalink {
  client: Manager;
  lavalinkName: string;
  constructor(client: Manager, lavalinkName: string) {
    this.client = client;
    this.lavalinkName = lavalinkName;
    this.execute();
  }

  async execute() {
    this.client.logger.lavalink("----- Starting autofix lavalink... -----");
    if (this.client.lavalinkList.length == 0) {
      new CheckLavalinkServer(this.client);
      return this.fixLavalink();
    } else return this.fixLavalink();
  }

  async fixLavalink() {
    const autofixError = chalk.hex("#e12885");
    const autofixErrorMess = autofixError("Error: ");

    this.checkLavalink();
    await this.removeCurrentLavalink();
    if (this.client.lavalinkList.filter((i) => i.online).length == 0) {
      this.client.logger.lavalink(autofixErrorMess + "No lavalink online or avalible for this bot.");
      this.client.logger.lavalink(
        autofixErrorMess + "Please shutdown the bot, enter the valid lavalink server (v4) and reboot the bot"
      );
      this.client.logger.lavalink("----- Terminated autofix lavalink. -----");
      return;
    }

    await this.applyNewLavalink();

    this.client.logger.lavalink("Now used new lavalink, please wait 1 second to make it connect.");
    this.client.logger.lavalink("----- Terminated autofix lavalink. -----");
  }

  checkLavalink() {
    if (this.client.manager.shoukaku.nodes.size !== 0 && this.client.lavalinkUsing.length == 0) {
      this.client.manager.shoukaku.nodes.forEach((data, index) => {
        const res = regex.exec(data["url"]);
        this.client.lavalinkUsing.push({
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
    const lavalinkIndex = this.client.lavalinkUsing.findIndex((data) => data.name == this.lavalinkName);
    const targetLavalink = this.client.lavalinkUsing[lavalinkIndex];
    if (this.client.manager.shoukaku.nodes.size == 0 && this.client.lavalinkUsing.length != 0) {
      this.client.lavalinkUsing.splice(lavalinkIndex, 1);
    } else if (this.client.manager.shoukaku.nodes.size !== 0 && this.client.lavalinkUsing.length !== 0) {
      const isLavalinkExist = this.client.manager.shoukaku.nodes.has(targetLavalink.name);
      if (isLavalinkExist) await this.client.manager.shoukaku.removeNode(targetLavalink.name);
      this.client.lavalinkUsing.splice(lavalinkIndex, 1);
    }
  }

  async applyNewLavalink() {
    const onlineList: LavalinkDataType[] = [];

    this.client.lavalinkList.filter(async (data) => {
      if (data.online == true) return onlineList.push(data);
    });

    const nodeInfo = onlineList[Math.floor(Math.random() * onlineList.length)];

    const newNodeInfo = {
      name: `${nodeInfo.host.replace(/[^A-Z0-9]+/gi, "_")}`,
      url: `${nodeInfo.host}:${nodeInfo.port}`,
      auth: nodeInfo.pass,
      secure: nodeInfo.secure,
    };

    await this.client.manager.shoukaku.addNode(newNodeInfo);

    return nodeInfo;
  }
}
