import {
  EmbedBuilder,
  CommandInteractionOptionResolver,
  ApplicationCommandOptionType,
  CommandInteraction,
  GuildMember,
} from "discord.js";
import { FormatDuration } from "../../../structures/FormatDuration.js";
import { PageQueue } from "../../../structures/PageQueue.js";
import { Manager } from "../../../manager.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";

// Main code
export default class implements SlashCommand {
  name = ["queue"];
  description = "Show the queue of songs.";
  category = "Music";
  lavalink = true;
  accessableby = Accessableby.Member;
  options = [
    {
      name: "page",
      description: "Page number to show.",
      type: ApplicationCommandOptionType.Number,
      required: false,
    },
  ];

  async run(
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) {
    await interaction.deferReply({ ephemeral: false });
    const value = (
      interaction.options as CommandInteractionOptionResolver
    ).getInteger("page");

    const player = client.manager.players.get(interaction.guild!.id);
    if (!player)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_player")}`
            )
            .setColor(client.color),
        ],
      });
    const { channel } = (interaction.member as GuildMember)!.voice;
    if (
      !channel ||
      (interaction.member as GuildMember)!.voice.channel !==
        interaction.guild!.members.me!.voice.channel
    )
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_voice")}`
            )
            .setColor(client.color),
        ],
      });

    const song = player.queue.current;
    function fixedduration() {
      const current = player!.queue.current!.length ?? 0;
      return player!.queue.reduce(
        (acc, cur) => acc + (cur.length || 0),
        current
      );
    }
    const qduration = `${new FormatDuration().parse(fixedduration())}`;
    const thumbnail = `https://img.youtube.com/vi/${
      song!.identifier
    }/hqdefault.jpg`;

    let pagesNum = Math.ceil(player.queue.length / 10);
    if (pagesNum === 0) pagesNum = 1;

    const songStrings = [];
    for (let i = 0; i < player.queue.length; i++) {
      const song = player.queue[i];
      songStrings.push(
        `**${i + 1}.** [${song.title}](${
          song.uri
        }) \`[${new FormatDuration().parse(song.length)}]\`
                    `
      );
    }

    const pages = [];
    for (let i = 0; i < pagesNum; i++) {
      const str = songStrings.slice(i * 10, i * 10 + 10).join("");

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${client.i18n.get(language, "music", "queue_author", {
            guild: interaction.guild!.name,
          })}`,
          iconURL: interaction.guild!.iconURL() as string,
        })
        .setThumbnail(thumbnail)
        .setColor(client.color)
        .setDescription(
          `${client.i18n.get(language, "music", "queue_description", {
            title: song!.title,
            url: String(song!.uri),
            request: String(song!.requester),
            duration: new FormatDuration().parse(song!.length),
            rest: str == "" ? "  Nothing" : "\n" + str,
          })}`
        )
        .setFooter({
          text: `${client.i18n.get(language, "music", "queue_footer", {
            page: String(i + 1),
            pages: String(pagesNum),
            queue_lang: String(player.queue.length),
            duration: qduration,
          })}`,
        });

      pages.push(embed);
    }

    if (!value) {
      if (pages.length == pagesNum && player.queue.length > 10)
        new PageQueue(
          client,
          pages,
          60000,
          player.queue.length,
          language
        ).slashPage(interaction, Number(qduration));
      else return interaction.editReply({ embeds: [pages[0]] });
    } else {
      if (isNaN(value))
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "music", "queue_notnumber")}`
              )
              .setColor(client.color),
          ],
        });
      if (value > pagesNum)
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "music", "queue_page_notfound", {
                  page: String(pagesNum),
                })}`
              )
              .setColor(client.color),
          ],
        });
      const pageNum = value == 0 ? 1 : value - 1;
      return interaction.editReply({ embeds: [pages[pageNum]] });
    }
  }
}
