import MarkdownIt from "markdown-it";
var md = new MarkdownIt();
import Token from "markdown-it/lib/token.js";

export class GetLavalinkServer {
  async execute() {
    const res = await fetch(
      "https://raw.githubusercontent.com/DarrenOfficial/lavalink-list/master/docs/NoSSL/lavalink-without-ssl.md"
    );
    const resJson = await res.text();
    return this.getLavalinkServerInfo(resJson);
  }

  getLavalinkServerInfo(data: string) {
    const MdCodeTagFilter: string[] = [];

    var result = md.parse(data, "");

    result.filter(async (data: Token) => {
      if (data.tag == "code") {
        MdCodeTagFilter.push(data.content);
      }
    });

    const lavalinkCredentailsFilter = this.parseData(MdCodeTagFilter);
    const final = this.commitData(lavalinkCredentailsFilter);

    return final;
  }

  parseBoolean(value: string) {
    if (typeof value === "string") {
      value = value.trim().toLowerCase();
    }
    switch (value) {
      case "true":
        return true;
      default:
        return false;
    }
  }

  parseData(MdCodeTagFilter: string[]) {
    const LavalinkCredentailsFilter: string[] = [];
    for (let i = 0; i < MdCodeTagFilter.length; i++) {
      const element = MdCodeTagFilter[i];
      // Phrase data
      const res = element.replace(/\n/g, "");
      const res2 = res.replace(/\s+/g, "");
      const res3 = res2.replace(/Host/g, "");
      const res4 = res3.replace(/Port/g, "");
      const res5 = res4.replace(/Password/g, "");
      const res6 = res5.replace(/Secure/g, "");
      const res7 = res6.replace(/[&\/\\#,+()$~%'"*?<>{}]/g, "");
      LavalinkCredentailsFilter.push(res7);
    }
    return LavalinkCredentailsFilter;
  }

  async commitData(LavalinkCredentailsFilter: string[]) {
    const FinalData = [];
    for (let i = 0; i < LavalinkCredentailsFilter.length; i++) {
      const regexExtract = /:(.{0,99999}):([0-9]{0,99999}):(.{0,99999}):(false|true)/;
      const element = LavalinkCredentailsFilter[i];
      const res = regexExtract.exec(element);
      res
        ? FinalData.push({
            host: res![1],
            port: Number(res![2]),
            pass: res![3],
            secure: this.parseBoolean(res![4]),
            name: `${res![1]}:${Number(res![2])}`,
            online: false,
          })
        : true;
    }
    return FinalData;
  }
}

// function parseBoolean(value: string) {
//   if (typeof value === "string") {
//     value = value.trim().toLowerCase();
//   }
//   switch (value) {
//     case "true":
//       return true;
//     default:
//       return false;
//   }
// }

// export default async () => {

// };
