import { Message, PermissionFlagsBits } from "discord.js";
import { GlobalInteraction } from "../@types/Interaction.js";

export interface CheckPermissionResultInterface {
  result: "PermissionPass" | string;
  channel: "Self" | string | "Pass";
}

export class CheckPermissionServices {
  interaction(interaction: GlobalInteraction, permArray: bigint[]): CheckPermissionResultInterface {
    const isUserInVoice = interaction.guild?.members.cache.get(interaction.user.id)?.voice.channel;

    const isUserInText = interaction.guild?.channels.cache.get(String(interaction.channelId));

    for (const permBit of permArray) {
      if (isUserInVoice && !isUserInVoice.permissionsFor(interaction.guild.members.me!).has(permBit)) {
        return {
          result: String(this.getPermissionName(permBit)),
          channel: isUserInVoice.id,
        };
      }
      if (isUserInText && !isUserInText.permissionsFor(interaction.guild!.members.me!).has(permBit))
        return {
          result: String(this.getPermissionName(permBit)),
          channel: isUserInText.id,
        };
      if (!interaction.guild!.members.me!.permissions.has(permBit)) {
        return {
          result: String(this.getPermissionName(permBit)),
          channel: "Self",
        };
      }
    }

    return {
      result: "PermissionPass",
      channel: "Pass",
    };
  }

  message(message: Message, permArray: bigint[]): CheckPermissionResultInterface {
    const isUserInVoice = message.guild?.members.cache.get(message.author.id)?.voice.channel;
    const isUserInText = message.guild?.channels.cache.get(String(message.channelId));
    for (const permBit of permArray) {
      if (isUserInVoice && !isUserInVoice.permissionsFor(message.guild.members.me!).has(permBit)) {
        return {
          result: String(this.getPermissionName(permBit)),
          channel: isUserInVoice.id,
        };
      }
      if (isUserInText && !isUserInText.permissionsFor(message.guild!.members.me!).has(permBit))
        return {
          result: String(this.getPermissionName(permBit)),
          channel: isUserInText.id,
        };
      if (!message.guild!.members.me!.permissions.has(permBit)) {
        return {
          result: String(this.getPermissionName(permBit)),
          channel: "Self",
        };
      }
    }
    return {
      result: "PermissionPass",
      channel: "Pass",
    };
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
