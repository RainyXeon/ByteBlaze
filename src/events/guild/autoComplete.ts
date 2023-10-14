import { Manager } from "../../manager.js";
import {
  InteractionType,
  CommandInteraction,
  AutocompleteInteraction,
} from "discord.js";
import {
  AutocompleteInteractionChoices,
  GlobalInteraction,
} from "../../types/Interaction.js";
import { SlashCommand } from "../../types/Command.js";

const REGEX = [
  /(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[-a-zA-Z0-9_]{11,}(?!\S))\/)|(?:\S*v=|v\/)))([-a-zA-Z0-9_]{11,})/,
  /^.*(youtu.be\/|list=)([^#\&\?]*).*/,
  /^(?:spotify:|https:\/\/[a-z]+\.spotify\.com\/(track\/|user\/(.*)\/playlist\/|playlist\/))(.*)$/,
  /^https?:\/\/(?:www\.)?deezer\.com\/[a-z]+\/(track|album|playlist)\/(\d+)$/,
  /^(?:(https?):\/\/)?(?:(?:www|m)\.)?(soundcloud\.com|snd\.sc)\/(.*)$/,
  /(?:https:\/\/music\.apple\.com\/)(?:.+)?(artist|album|music-video|playlist)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)/,
  /^https?:\/\/(?:www\.|secure\.|sp\.)?nicovideo\.jp\/watch\/([a-z]{2}[0-9]+)/,
];

export default async (
  client: Manager,
  interaction: GlobalInteraction,
  language: string,
  command: SlashCommand
) => {
  // Push Function
  async function AutoCompletePush(
    url: string,
    choice: AutocompleteInteractionChoices[]
  ) {
    const Random =
      client.config.lavalink.DEFAULT[
        Math.floor(Math.random() * client.config.lavalink.DEFAULT.length)
      ];
    const match = REGEX.some((match) => {
      return match.test(url) == true;
    });
    if (match == true) {
      choice.push({ name: url, value: url });
      await (interaction as AutocompleteInteraction)
        .respond(choice)
        .catch(() => {});
    } else {
      if (client.lavalink_using.length == 0) {
        choice.push({
          name: `${client.i18n.get(language, "music", "no_node")}`,
          value: `${client.i18n.get(language, "music", "no_node")}`,
        });
        return;
      }
      await client.manager.search(url || Random).then((result) => {
        if (result.tracks.length == 0 || !result.tracks) {
          return choice.push({ name: "Error song not matches", value: url });
        }
        for (let i = 0; i < 10; i++) {
          const x = result.tracks[i];
          choice.push({ name: x.title || "Unknown track name", value: x.uri });
        }
      });
      await (interaction as AutocompleteInteraction)
        .respond(choice)
        .catch(() => {});
    }
  }

  if (
    Number(interaction.type) == InteractionType.ApplicationCommandAutocomplete
  ) {
    if (
      (interaction as CommandInteraction).commandName == "play" ||
      (interaction as CommandInteraction).commandName + command!.name[1] ==
        "playlist" + "add"
    ) {
      let choice: AutocompleteInteractionChoices[] = [];
      const url = (interaction as CommandInteraction).options.get(
        "search"
      )!.value;
      return AutoCompletePush(url as string, choice);
    } else if (
      (interaction as CommandInteraction).commandName + command!.name[1] ==
      "playlist" + "edit"
    ) {
      let choice: AutocompleteInteractionChoices[] = [];
      const url = (interaction as CommandInteraction).options.get("add")!.value;
      return AutoCompletePush(url as string, choice);
    }
  }
};
