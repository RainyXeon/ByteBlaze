import { KazagumoPlayer } from "better-kazagumo";
import { Manager } from "../../manager.js";
import { EmbedBuilder, Client, TextChannel } from "discord.js";
import { ClearMessageService } from "../../functions/clearMsg.js";
import { KazagumoLoop } from "../../@types/Lavalink.js";
import { AutoReconnectBuilder } from "../../database/build/AutoReconnect.js";

export default class {
  async execute(client: Manager, player: KazagumoPlayer) {
    if (!client.is_db_connected)
      return client.logger.warn(
        "The database is not yet connected so this event will temporarily not execute. Please try again later!"
      );

    const guild = await client.guilds.cache.get(player.guildId);
    client.logger.info(
      `Player Destroy in @ ${guild!.name} / ${player.guildId}`
    );

    /////////// Update Music Setup //////////
    await client.UpdateMusic(player);
    /////////// Update Music Setup ///////////

    if (client.websocket)
      client.websocket.send(
        JSON.stringify({ op: "player_destroy", guild: player.guildId })
      );
    const channel = client.channels.cache.get(player.textId) as TextChannel;
    client.sent_queue.set(player.guildId, false);
    let data = await new AutoReconnectBuilder(client, player).get(
      player.guildId
    );

    if (!channel) return;

    if (player.state == 5 && data !== null && data) {
      if (data.twentyfourseven) {
        await client.manager.createPlayer({
          guildId: data.guild!,
          voiceId: data.voice!,
          textId: data.text!,
          deaf: true,
        });
        await new AutoReconnectBuilder(client, player).noPlayerBuild(player.guildId)
      }
      else await client.db.autoreconnect.delete(player.guildId) 
    }

    let guildModel = await client.db.language.get(`${channel.guild.id}`);
    if (!guildModel) {
      guildModel = await client.db.language.set(`${channel.guild.id}`, "en");
    }

    const language = guildModel;

    const embed = new EmbedBuilder()
      .setColor(client.color)
      .setDescription(
        `${client.i18n.get(language, "player", "queue_end_desc")}`
      );

    if (channel) {
      const msg = await channel.send({ embeds: [embed] });

      const setupdata = await client.db.setup.get(`${player.guildId}`);
      if (setupdata) return;
      setTimeout(
        async () => msg.delete(),
        client.config.bot.DELETE_MSG_TIMEOUT
      );
      new ClearMessageService(client, channel, player);
    }
  }
}
