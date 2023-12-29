import { Message, PermissionFlagsBits } from "discord.js";
import { GlobalInteraction } from "../@types/Interaction.js";

export class CheckPermissionServices {
  interaction(
    interaction: GlobalInteraction,
    permArray: bigint[]
  ): "PermissionPass" | string {
    const isUserInVoice = interaction.guild?.members.cache.get(
      interaction.user.id
    )?.voice.channel;

    const isUserInText = interaction.guild?.channels.cache.get(
      String(interaction.channelId)
    );

    for (const permBit of permArray) {
      if (!interaction.guild!.members.me!.permissions.has(permBit)) {
        return String(this.getPermissionName(permBit));
      }
      if (
        isUserInVoice &&
        !isUserInVoice
          .permissionsFor(interaction.guild.members.me!)
          .has(permBit)
      ) {
        return String(this.getPermissionName(permBit));
      }
      if (
        isUserInText &&
        !isUserInText
          .permissionsFor(interaction.guild!.members.me!)
          .has(permBit)
      )
        return String(this.getPermissionName(permBit));
    }

    return "PermissionPass";
  }

  message(message: Message, permArray: bigint[]): "PermissionPass" | string {
    const isUserInVoice = message.guild?.members.cache.get(message.author.id)
      ?.voice.channel;
    const isUserInText = message.guild?.channels.cache.get(
      String(message.channelId)
    );
    for (const permBit of permArray) {
      if (!message.guild!.members.me!.permissions.has(permBit)) {
        return String(this.getPermissionName(permBit));
      }
      if (
        isUserInVoice &&
        !isUserInVoice.permissionsFor(message.guild.members.me!).has(permBit)
      ) {
        return String(this.getPermissionName(permBit));
      }
      if (
        isUserInText &&
        !isUserInText.permissionsFor(message.guild!.members.me!).has(permBit)
      )
        return String(this.getPermissionName(permBit));
    }
    return "PermissionPass";
  }

  private getPermissionName(permission: bigint): string {
    for (const perm of Object.keys(PermissionFlagsBits)) {
      if ((PermissionFlagsBits as any)[perm] === permission) {
        return perm;
      }
    }
    return "UnknownPermission";
  }
}
