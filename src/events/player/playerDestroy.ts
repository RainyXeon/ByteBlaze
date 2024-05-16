import { Manager } from "../../manager.js";
import { EmbedBuilder, TextChannel } from "discord.js";
import { ClearMessageService } from "../../services/ClearMessageService.js";
import { AutoReconnectBuilderService } from "../../services/AutoReconnectBuilderService.js";
import { RainlinkPlayer, RainlinkPlayerState } from "../../rainlink/main.js";

export default class {
  async execute(client: Manager, player: RainlinkPlayer) {
    if (!client.isDatabaseConnected)
      return client.logger.warn(
        "DatabaseService",
        "The database is not yet connected so this event will temporarily not execute. Please try again later!"
      );

    const guild = await client.guilds.fetch(player.guildId).catch(() => undefined);
    client.logger.info("PlayerDestroy", `Player Destroy in @ ${guild?.name} / ${player.guildId}`);

    /////////// Update Music Setup //////////
    await client.UpdateMusic(player);
    /////////// Update Music Setup ///////////

    client.emit("playerDestroy", player);
    const channel = (await client.channels.fetch(player.textId).catch(() => undefined)) as TextChannel;
    client.sentQueue.set(player.guildId, false);
    let data = await new AutoReconnectBuilderService(client, player).get(player.guildId);

    if (!channel) return;

    if (data !== null && data && data.twentyfourseven) {
      await new AutoReconnectBuilderService(client, player).build247(player.guildId, true, data.voice);
      client.rainlink.players.create({
        guildId: data.guild!,
        voiceId: data.voice!,
        textId: data.text!,
        shardId: guild?.shardId ?? 0,
        deaf: true,
        volume: client.config.lavalink.DEFAULT_VOLUME ?? 100,
      });
    } else await client.db.autoreconnect.delete(player.guildId);

    let guildModel = await client.db.language.get(`${channel.guild.id}`);
    if (!guildModel) {
      guildModel = await client.db.language.set(`${channel.guild.id}`, client.config.bot.LANGUAGE);
    }

    const language = guildModel;

    const isSudoDestroy = player.data.get("sudo-destroy");

    const embed = new EmbedBuilder()
      .setColor(client.color)
      .setDescription(`${client.getString(language, "event.player", "queue_end_desc")}`);

    if (!isSudoDestroy) {
      const setup = await client.db.setup.get(player.guildId);
      const msg = await channel.send({ embeds: [embed] });
      setTimeout(
        async () => (!setup || setup == null || setup.channel !== channel.id ? msg.delete().catch(() => null) : true),
        client.config.bot.DELETE_MSG_TIMEOUT
      );
    }

    const setupdata = await client.db.setup.get(`${player.guildId}`);
    if (setupdata?.channel == player.textId) return;
    new ClearMessageService(client, channel, player);
    player.data.clear();
  }
}
