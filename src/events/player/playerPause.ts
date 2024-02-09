import { PlayerState } from "../../lib/main.js";
import {
  playerRowOneEdited,
  playerRowTwo,
} from "../../assets/PlayerControlButton.js";
import { KazagumoPlayer } from "../../lib/main.js";
import { Manager } from "../../manager.js";
import { TextChannel } from "discord.js";

export default class {
  async execute(client: Manager, player: KazagumoPlayer) {
    if (player.voiceId == null) return;

    const nowPlaying = client.nplayingMsg.get(`${player.guildId}`);
    if (nowPlaying) {
      nowPlaying.edit({ components: [playerRowOneEdited, playerRowTwo] });
    }

    const setup = await client.db.setup.get(`${player.guildId}`);

    if (setup && setup.playmsg) {
      const channel = await client.channels.fetch(setup.channel);
      if (!channel) return;
      if (!channel.isTextBased) return;
      const msg = await (channel as TextChannel).messages.fetch(setup.playmsg);
      if (!msg) return;
      msg.edit({ components: [client.enSwitch] });
    }
  }
}
