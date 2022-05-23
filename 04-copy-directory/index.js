const fs = require('node:fs');
const path = require('node:path');

const sourceDir = path.resolve(__dirname, 'files');
const destinationDir = path.resolve(__dirname, 'files-copy');

async function copyDir(src, dest) {
  let isDestinationDirExists = false;
  fs.promises.mkdir(dest, { recursive: true }).then((path) => {
    if (!path) isDestinationDirExists = true;
  });

  const sourceDirEntities = await fs.promises.readdir(src, {
    encoding: 'utf-8',
    withFileTypes: true,
  });

  const sourceFilenames = sourceDirEntities
    .filter((entity) => entity.isFile())
    .map((entity) => entity.name);

  // delete files from destination if there no such files in source
  if (isDestinationDirExists) {
    const destDirEntities = await fs.promises.readdir(dest, {
      encoding: 'utf-8',
      withFileTypes: true,
    });

    const distFilenames = destDirEntities
      .filter((entity) => entity.isFile())
      .map((entity) => entity.name);

    distFilenames.forEach((filename) => {
      if (!sourceFilenames.includes(filename)) {
        fs.promises.unlink(path.resolve(destinationDir, filename)); // remove excess file
      }
    });
  }

  console.log(sourceFilenames);

  for (let fileName of sourceFilenames) {
    const from = path.resolve(src, fileName);
    const to = path.resolve(dest, fileName);
    fs.copyFile(from, to, (error) => {
      if (error) console.log(error);
    });
  }
}

copyDir(sourceDir, destinationDir);
