import {
  PermissionsBitField,
  EmbedBuilder,
  VoiceState,
  GuildMember,
  Role,
  TextChannel,
} from "discord.js";
import { Manager } from "../../manager.js";
import { AutoReconnectBuilderService } from "../../services/AutoReconnectBuilderService.js";
import { PlayerState } from "../../lib/main.js";

export default class {
  async execute(client: Manager, oldState: VoiceState, newState: VoiceState) {
    if (!client.isDatabaseConnected)
      return client.logger.warn(
        "The database is not yet connected so this event will temporarily not execute. Please try again later!"
      );

    let data = await new AutoReconnectBuilderService(client).get(
      newState.guild.id
    );

    client.emit("voiceStateUpdateJoin", oldState, newState);
    client.emit("voiceStateUpdateLeave", oldState, newState);

    let guildModel = await client.db.language.get(`${newState.guild.id}`);
    if (!guildModel) {
      guildModel = await client.db.language.set(
        `${newState.guild.id}`,
        client.config.bot.LANGUAGE
      );
    }
    const language = guildModel;

    const player = client.manager?.players.get(newState.guild.id);
    if (!player) return;

    if (data && data.twentyfourseven) return;

    // if (!newState.guild.members.cache.get(client.user!.id)!.voice.channelId) {
    //   const newCheckPlayer = await client.manager.players.get(
    //     newState.guild.id
    //   );
    //   if (newCheckPlayer) {
    //     switch (newCheckPlayer.state) {
    //       case PlayerState.CONNECTED:
    //         player.data.set("sudo-destroy", true);
    //         player.destroy();
    //         break;
    //       case PlayerState.CONNECTING:
    //         player.data.set("sudo-destroy", true);
    //         player.destroy();
    //     }
    //   }
    // }

    if (
      newState.channelId &&
      String(newState.channel!.type) == "GUILD_STAGE_VOICE" &&
      newState.guild.members.me!.voice.suppress
    ) {
      if (
        newState.guild.members.me!.permissions.has(
          PermissionsBitField.Flags.Connect
        ) ||
        (newState.channel &&
          newState.channel
            .permissionsFor(newState.guild.members.me as GuildMember | Role)
            .has(PermissionsBitField.Flags.Speak))
      ) {
        newState.guild.members.me!.voice.setSuppressed(false);
      }
    }

    if (oldState.id === client.user!.id) return;
    if (!oldState.guild.members.cache.get(client.user!.id)!.voice.channelId)
      return;

    const vcRoom = oldState.guild.members.me!.voice.channel!.id;

    const leaveEmbed = client.channels.cache.get(player.textId) as TextChannel;

    if (
      newState.guild.members.me!.voice?.channel &&
      newState.guild.members.me!.voice.channel.members.filter(
        (m) => m.user.id !== client.user?.id
      ).size !== 0
    ) {
      if (oldState.channelId) return;
      if (oldState.channelId === newState.channelId) return;
      if (newState.guild.members.me!.voice.channel.members.size > 2) return;
      // Resume player

      const leaveTimeout = client.leaveDelay.get(newState.guild.id);
      if (leaveTimeout) {
        clearTimeout(leaveTimeout);
        client.leaveDelay.delete(newState.guild.id);
      }

      player.paused == false ? true : player.pause(false);
      if (player.paused == false && player.shoukaku.track !== null) {
        const msg = await leaveEmbed.send({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "player", "leave_resume")}`
              )
              .setColor(client.color),
          ],
        });
        setTimeout(
          async () => msg.delete(),
          client.config.bot.DELETE_MSG_TIMEOUT
        );
      }
    }

    if (
      oldState.guild.members.cache.get(client.user!.id)!.voice.channelId ===
      oldState.channelId
    ) {
      if (
        oldState.guild.members.me!.voice?.channel &&
        oldState.guild.members.me!.voice.channel.members.filter(
          (m) => !m.user.bot
        ).size === 0
      ) {
        // Pause player
        player.paused == true ? true : player.pause(true);

        if (player.paused == true && player.shoukaku.track !== null) {
          const msg = await leaveEmbed.send({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `${client.i18n.get(language, "player", "leave_pause")}`
                )
                .setColor(client.color),
            ],
          });
          setTimeout(
            async () => msg.delete(),
            client.config.bot.DELETE_MSG_TIMEOUT
          );
        }

        // Delay leave timeout
        let leaveDelayTimeout = setTimeout(async () => {
          const vcMembers =
            oldState.guild.members.me!.voice.channel?.members.size;
          if (!vcMembers || vcMembers === 1) {
            const newPlayer = client.manager?.players.get(newState.guild.id);
            player.data.set("sudo-destroy", true);
            if (newPlayer) player.destroy();
            const TimeoutEmbed = new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "player", "player_end", {
                  leave: vcRoom,
                })}`
              )
              .setColor(client.color);
            try {
              if (leaveEmbed) {
                const msg = newPlayer
                  ? await leaveEmbed.send({ embeds: [TimeoutEmbed] })
                  : undefined;
                setTimeout(
                  async () => (msg ? msg.delete() : undefined),
                  client.config.bot.DELETE_MSG_TIMEOUT
                );
              }
            } catch (error) {
              client.logger.error(error);
            }
          }
        }, client.config.lavalink.LEAVE_TIMEOUT);
        client.leaveDelay.set(newState.guild.id, leaveDelayTimeout);
      }
    }
  }
}
