import { spawn } from "node:child_process";
import archiver from "dir-archiver";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import fse from "fs-extra";
import { plsParseArgs } from "plsargs";
import copydir from "copy-dir";
const args = plsParseArgs(process.argv.slice(2));
const parser = new XMLParser();
const builder = new XMLBuilder();
const objectDate = Date.now();

const acceptedParams = ["clean", "build", "build:github"];

const ignored = [
  "node_modules",
  ".env",
  ".eslintrc.cjs",
  ".gitignore",
  ".prettierrc.json",
  "app.yml",
  ".git",
  ".cylane",
  "src",
  "scripts",
  "build.mjs",
  "byteblaze.database.json",
  "pnpm-lock.yaml",
  "tsconfig.json",
  ".github",
  "out",
  "logs",
];

function logger(data, type) {
  const text = String(data).replace(/(\r\n|\n|\r)/gm, " || ");
  switch (type) {
    case "build":
      console.log(`BUILD - ${text}`);
      break;
    case "info":
      console.log(`INFO - ${text}`);
      break;
    case "error":
      console.log(`ERROR - ${text}`);
      break;
  }
}

logger("ByteBlaze .zip build script", "info");
logger("Version: 1.0.0", "info");

if (!acceptedParams.includes(args.get(0))) {
  throw new Error("Only clean or build, example: node build.mjs build");
}

if (args.get(0) == acceptedParams[0]) {
  const checkDir = ["./dist", "./out", "./.cylane", "./logs"];

  checkDir.forEach(async (data) => {
    if (fse.existsSync(data)) fse.rmdirSync(data, { recursive: true, force: true });
  });

  logger("Clean successfully!", "info");
  process.exit();
}

if (args.get(0) == acceptedParams[2]) {
  const child = spawn(/^win/.test(process.platform) ? "npm.cmd" : "npm", ["run", "build:full"]);

  child.stdout.on("data", (data) => {
    logger(data, "build");
  });

  child.stderr.on("data", (data) => {
    logger(data, "build");
  });

  child.on("error", (error) => {
    logger(error.message, "error");
  });

  child.on("close", async (code) => {
    logger(`Build finished with code ${code}`, "build");

    // Edit manifest
    const manifestRaw = fse.readFileSync("./dist/manifest.xml", "utf-8");
    const manifest = parser.parse(manifestRaw);
    const botVersion = manifest.metadata.bot.version;
    const warningData =
      `\n` +
      "<!-- THIS IS THE METADATA BOT FILE -->" +
      `\n` +
      "<!-- Do NOT delete this file or it will crash -->" +
      `\n` +
      "<!-- Changes to this file may cause incorrect behavior -->" +
      `\n` +
      "<!-- You will be responsible for this when changing any content in the file. -->" +
      `\n`;

    manifest.metadata.bot.version = `${botVersion}+${objectDate}`;

    fse.writeFileSync("./dist/manifest.xml", builder.build(manifest) + warningData, "utf-8");

    logger("Edit manifest file complete!", "build");

    await fse.mkdir("./out");
    await fse.mkdir("./out/ByteBlaze");

    copydir.sync(".", "./out/ByteBlaze", {
      filter: function (stat, filepath, filename) {
        if (stat === "file" && ignored.includes(filename)) {
          return false;
        }
        if (stat === "directory" && ignored.includes(filename)) {
          return false;
        }
        return true; // remind to return a true value when file check passed.
      },
    });
  });
} else {
  // Build (Local build)
  const child = spawn(/^win/.test(process.platform) ? "npm.cmd" : "npm", ["run", "build:full"]);

  child.stdout.on("data", (data) => {
    logger(data, "build");
  });

  child.stderr.on("data", (data) => {
    logger(data, "build");
  });

  child.on("error", (error) => {
    logger(error.message, "error");
  });

  child.on("close", async (code) => {
    logger(`Build finished with code ${code}`, "build");

    // Edit manifest
    const manifestRaw = fse.readFileSync("./dist/manifest.xml", "utf-8");
    const manifest = parser.parse(manifestRaw);
    const botVersion = manifest.metadata.bot.version;
    const warningData =
      `\n` +
      "<!-- THIS IS THE METADATA BOT FILE -->" +
      `\n` +
      "<!-- Do NOT delete this file or it will crash -->" +
      `\n` +
      "<!-- Changes to this file may cause incorrect behavior -->" +
      `\n` +
      "<!-- You will be responsible for this when changing any content in the file. -->" +
      `\n`;

    manifest.metadata.bot.version = `${botVersion}+${objectDate}`;

    fse.writeFileSync("./dist/manifest.xml", builder.build(manifest) + warningData, "utf-8");

    logger("Edit manifest file complete!", "build");

    // Archive build
    await fse.mkdir("./out");
    const path = `./out/ByteBlaze.zip`;

    const zipper = new archiver(".", path, false, ignored);
    zipper.createZip();
    logger("Archive all build file successfully!!!", "build");
    logger("Build bot successfully!!!");
  });
}
