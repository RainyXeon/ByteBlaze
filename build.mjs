// BETA!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

import { spawn } from "node:child_process";
import archiver from "dir-archiver";
import { rimraf } from "rimraf";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import fse from "fs-extra";
import { plsParseArgs } from "plsargs";
const args = plsParseArgs(process.argv.slice(2));
const parser = new XMLParser();
const builder = new XMLBuilder();
const objectDate = Date.now();

const acceptedParams = ["clean", "build"];

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

if (!acceptedParams.includes(args.get(0))) {
  throw new Error("Only clean or build, example: node build.mjs build");
}

if (args.get(0) == acceptedParams[0]) {
  rimraf.sync("/dist");
  rimraf.sync("/out");
  rimraf.sync("/.cylane");
  rimraf.sync("/logs");
  rimraf.sync("/temp");
  logger("Clean successfully!", "info");
  process.exit();
}

// Build
const child = spawn(/^win/.test(process.platform) ? "npm.cmd" : "npm", [
  "run",
  "build:full",
]);

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

  // Creating temp
  if (!fse.existsSync("./temp")) await fse.mkdir("./temp");
  else {
    await rimraf.sync("./temp");
    await fse.mkdir("./temp");
  }

  try {
    fse.copySync("./dist", "./temp", { overwrite: true });
    console.log("Making temp to edit manifest file...");
  } catch (err) {
    console.error(err);
  }

  // Remove current dist
  await rimraf.sync("./dist");

  // Edit manifest
  const manifestRaw = fse.readFileSync("./temp/manifest.xml", "utf-8");
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

  fse.writeFileSync(
    "./temp/manifest.xml",
    builder.build(manifest) + warningData,
    "utf-8"
  );

  logger(
    "Edit manifest file complete! Now give all build file back to dist folder",
    "build"
  );

  // Give back to dist folder
  await fse.mkdir("./dist");

  try {
    fse.copySync("./temp", "./dist", { overwrite: true });
    logger(
      "Give all build file back to dist folder complete! Removing temp...",
      "build"
    );
  } catch (err) {
    console.error(err);
  }

  await rimraf.sync("./temp");
  logger("Remove complete! Now archive all build file...", "build");

  // Archive build
  await fse.mkdir("./out");
  const path = `./out/byteblaze-build-${objectDate}.zip`;

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
    "cylane.database.json",
    "pnpm-lock.yaml",
    "README.md",
    "tsconfig.json",
  ];
  const zipper = new archiver(".", path, true, ignored);
  zipper.createZip();
  logger("Archive all build file successfully!!!", "build");
  logger("Build bot successfully!!!");
});
