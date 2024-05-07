import { Message, PermissionFlagsBits } from "discord.js";
import { GlobalInteraction } from "../@types/Interaction.js";

export interface CheckPermissionResultInterface {
  result: "PermissionPass" | string;
  channel: "Self" | string | "Pass";
}

export class CheckPermissionServices {
  async interaction(interaction: GlobalInteraction, permArray: bigint[]): Promise<CheckPermissionResultInterface> {
    const voiceChannel = await interaction.guild?.members.fetch(interaction.user.id).catch(() => undefined);

    const isUserInVoice = voiceChannel?.voice.channel;

    const isUserInText = await interaction.guild?.channels.fetch(String(interaction.channelId)).catch(() => undefined);

    for (const permBit of permArray) {
      if (isUserInVoice && !isUserInVoice.permissionsFor(interaction.guild?.members.me!).has(permBit)) {
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

  async message(message: Message, permArray: bigint[]): Promise<CheckPermissionResultInterface> {
    const voiceChannel = await message.guild?.members.fetch(message.author.id).catch(() => undefined);
    const isUserInVoice = voiceChannel?.voice.channel;
    const isUserInText = await message.guild?.channels.fetch(String(message.channelId)).catch(() => undefined);
    for (const permBit of permArray) {
      if (isUserInVoice && !isUserInVoice.permissionsFor(message.guild?.members.me!).has(permBit)) {
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
