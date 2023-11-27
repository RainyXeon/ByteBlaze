import { Manager } from "../../manager.js";
import { JSON_MESSAGE } from "../../@types/Websocket.js";
import { RequestInterface } from "../RequestInterface.js";
import WebSocket from "ws";

export default class implements RequestInterface {
  name = "status.member";
  run = async (client: Manager, json: JSON_MESSAGE, ws: WebSocket) => {
    if (!json.user)
      return ws.send(
        JSON.stringify({ error: "0x115", message: "No user's id provided" })
      );
    if (!json.guild)
      return ws.send(
        JSON.stringify({ error: "0x120", message: "No guild's id provided" })
      );

    const Guild = await client.guilds.fetch(json.guild);
    const Member = await Guild.members.fetch(json.user);

    if (!Member.voice.channel || !Member.voice) {
      // Checking if the member is connected to a VoiceChannel.
      ws.send(
        JSON.stringify({ guild: json.guild, op: "voice_state_update_leave" })
      );
    } else {
      ws.send(
        JSON.stringify({ guild: json.guild, op: "voice_state_update_join" })
      );
    }
  };
}
