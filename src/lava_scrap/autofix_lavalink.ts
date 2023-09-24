import { Manager } from "../manager.js";
import { LavalinkDataType } from "../types/Lavalink.js";
const regex =
  /^(wss?|ws?:\/\/)([0-9]{1,3}(?:\.[0-9]{1,3}){3}|[^\/]+):([0-9]{1,5})$/;

async function check_lavalink(client: Manager) {
  if (
    client.manager.shoukaku.nodes.size !== 0 &&
    client.lavalink_using.length == 0
  ) {
    client.manager.shoukaku.nodes.forEach((data, index) => {
      const res = regex.exec(data["url"]);
      client.lavalink_using.push({
        host: res![2],
        port: Number(res![3]),
        pass: data["auth"],
        secure: res![1] == "ws://" ? false : true,
        name: index,
      });
    });
  }

  // Remove current

  if (
    client.manager.shoukaku.nodes.size == 0 &&
    client.lavalink_using.length != 0
  ) {
    client.used_lavalink.push(client.lavalink_using[0]);
    client.lavalink_using.splice(0, 1);
  } else if (
    client.manager.shoukaku.nodes.size !== 0 &&
    client.lavalink_using.length !== 0
  ) {
    client.used_lavalink.push(client.lavalink_using[0]);
    await client.manager.shoukaku.removeNode(client.lavalink_using[0].name);
    client.lavalink_using.splice(0, 1);
  }

  // Fix when have lavalink
  const online_list: LavalinkDataType[] = [];

  client.lavalink_list.filter(async (data) => {
    if (data.online == true) return online_list.push(data);
  });

  const node_info = online_list[Math.floor(Math.random() * online_list.length)];

  const new_node_info = {
    name: `${node_info.host}:${node_info.port}`,
    url: `${node_info.host}:${node_info.port}`,
    auth: node_info.pass,
    secure: node_info.secure,
  };

  await client.manager.shoukaku.addNode(new_node_info);

  client.lavalink_using.push({
    host: node_info.host,
    port: node_info.port,
    pass: node_info.pass,
    secure: node_info.secure,
    name: `${node_info.host}:${node_info.port}`,
  });
}

export default async (client: Manager) => {
  client.logger.lavalink("----- Starting autofix lavalink... -----");
  if (client.lavalink_list.length == 0)
    (await import("./check_lavalink_server.js")).default(client).then(() => {
      return check_lavalink(client);
    });
  else return check_lavalink(client);
};
