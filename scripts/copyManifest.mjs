import fs from "node:fs";

fs.copyFile("./src/manifest.xml", "./dist/manifest.xml", (err) => {
  if (err) {
    console.log("Error Found:", err);
  } else {
    console.log('Copied manifest from "src" directory successfully!');
  }
});
