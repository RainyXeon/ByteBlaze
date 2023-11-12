// BETA!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

import { spawn } from "node:child_process";
import archiver from "dir-archiver";

let objectDate = new Date();

let day = objectDate.getDate();
let month = objectDate.getMonth();
let year = objectDate.getFullYear();

let format = month + "/" + day + "/" + year;

function logger(data, type) {
  const text = String(data).replace(/(\r\n|\n|\r)/gm, " || ");
  switch (type) {
    case "build":
      console.log(`BUILD - ${text}`)
      break
    case "info":
      console.log(`INFO - ${text}`)
      break
    case "error":
      console.log(`ERROR - ${text}`)
      break
  }
}

// Build
const child = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run',  "build:full"]);

child.stdout.on("data", data => {
  logger(data, "build");
});

child.stderr.on("data", data => {
  logger(data, "build");
});

child.on('error', (error) => {
  logger(error.message, "error");
});

child.on("close", code => {
  logger(`Build finished with code ${code}`, "build");

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
    "build.mjs",
    "cylane.database.json",
    "LICENSE",
    "pnpm-lock.yaml",
    "README.md",
    "start.bat",
    "start.sh",
    "tsconfig.json"
  ];
  const zipper = new archiver(".", `../byteblaze-build-${Date.now()}.zip`, false, ignored);
  zipper.createZip();
});