import fse from "fs-extra";
const { copySync } = fse;

const srcDir = `./src/languages/`;
const destDir = `./dist/languages/`;

// To copy a folder or file, select overwrite accordingly
try {
  copySync(srcDir, destDir, { overwrite: true });
  console.log('Copied language package from "src" directory successfully!');
} catch (err) {
  console.error(err);
}
