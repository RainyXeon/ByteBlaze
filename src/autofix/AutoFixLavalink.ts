import { Manager } from "../manager.js";
import { LavalinkDataType } from "../@types/Lavalink.js";
import { CheckLavalinkServer } from "./CheckLavalinkServer.js";
import chalk from "chalk";

export class AutoFixLavalink {
  client: Manager;
  lavalinkName: string;
  constructor(client: Manager, lavalinkName: string) {
    this.client = client;
    this.lavalinkName = lavalinkName;
    this.execute();
  }

  async execute() {
    this.client.logger.lavalink(AutoFixLavalink.name, "----- Starting autofix lavalink... -----");
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
      this.client.logger.lavalink(
        AutoFixLavalink.name,
        autofixErrorMess + "No lavalink online or avalible for this bot."
      );
      this.client.logger.lavalink(
        AutoFixLavalink.name,
        autofixErrorMess + "Please shutdown the bot, enter the valid lavalink server (v4) and reboot the bot"
      );
      this.client.logger.lavalink(AutoFixLavalink.name, "----- Terminated autofix lavalink. -----");
      return;
    }

    await this.applyNewLavalink();

    this.client.logger.lavalink(
      AutoFixLavalink.name,
      "Now used new lavalink, please wait 1 second to make it connect."
    );
    this.client.logger.lavalink(AutoFixLavalink.name, "----- Terminated autofix lavalink. -----");
  }

  checkLavalink() {
    if (this.client.rainlink.nodes.size !== 0 && this.client.lavalinkUsing.length == 0) {
      this.client.rainlink.nodes.forEach((data, index) => {
        this.client.lavalinkUsing.push({
          host: data.options.host,
          port: data.options.port,
          pass: data.options.auth,
          secure: data.options.secure,
          name: index,
        });
      });
    }
  }

  async removeCurrentLavalink() {
    const lavalinkIndex = this.client.lavalinkUsing.findIndex((data) => data.name == this.lavalinkName);
    const targetLavalink = this.client.lavalinkUsing[lavalinkIndex];
    if (this.client.rainlink.nodes.size == 0 && this.client.lavalinkUsing.length != 0) {
      this.client.lavalinkUsing.splice(lavalinkIndex, 1);
    } else if (this.client.rainlink.nodes.size !== 0 && this.client.lavalinkUsing.length !== 0) {
      const isLavalinkExist = this.client.rainlink.nodes.get(targetLavalink.name);
      if (isLavalinkExist) this.client.rainlink.nodes.remove(targetLavalink.name);
      this.client.lavalinkUsing.splice(lavalinkIndex, 1);
    }
  }

  async applyNewLavalink() {
    const onlineList: LavalinkDataType[] = [];

    this.client.lavalinkList.filter(async (data) => {
      if (data.online == true) return onlineList.push(data);
    });

    const nodeInfo = onlineList[Math.floor(Math.random() * onlineList.length)];

    this.client.rainlink.nodes.add({
      port: nodeInfo.port,
      host: nodeInfo.host,
      auth: nodeInfo.pass,
      name: nodeInfo.name,
      secure: nodeInfo.secure,
    });

    return nodeInfo;
  }
}
