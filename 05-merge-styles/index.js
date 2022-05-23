const fs = require('node:fs');
const path = require('path');

const pathToStylesDir = path.resolve(__dirname, 'styles');
const pathToDist = path.resolve(__dirname, 'project-dist');

async function mergeStyles(sourceDir, destinationDir) {
  const stylesDirEntities = await fs.promises.readdir(sourceDir, {
    encoding: 'utf-8',
    withFileTypes: true,
  });

  const stylesDirFilenames = stylesDirEntities
    .filter((ent) => ent.isFile() && path.extname(ent.name) === '.css')
    .map((ent) => ent.name);

  const pathsToStyleFiles = stylesDirFilenames.map((filename) =>
    path.resolve(sourceDir, filename)
  );

  const readableStylesStreams = pathsToStyleFiles.map((path) =>
    fs.createReadStream(path, 'utf-8')
  );

  let writableStyleStream = fs.createWriteStream(
    path.resolve(destinationDir, 'bundle.css'),
    'utf-8'
  );

  // let styles = await assembleReadableStreams(readableStylesStreams); // returns string of styles
  // writableStyleStream.write(styles);

  assembleStreams(readableStylesStreams, writableStyleStream);
}

function assembleStreams(readStreams, writeStream) {
  for (let readStream of readStreams) {
    //readStream.pipe(writeStream);
    readStream.on('data', (chunk) => {
      writeStream.write(chunk);
      writeStream.write('\n');
    });
  }
}

mergeStyles(pathToStylesDir, pathToDist);

// async function assembleReadableStreams(streams) {
//   let text = '';
//   for await (let stream of streams) {
//     for await (let chunk of stream) {
//       text += chunk + '\n';
//     }
//   }
//   return text;
// }
