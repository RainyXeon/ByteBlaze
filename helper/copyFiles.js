import fse from "fs-extra";

const srcDir = `./src/languages/`;
const destDir = `./dist/languages/`;

// To copy a folder or file, select overwrite accordingly
try {
  fse.copySync(srcDir, destDir, { overwrite: true | false });
  console.log('Copied language package from "src" directory successfully!');
} catch (err) {
  console.error(err);
}
