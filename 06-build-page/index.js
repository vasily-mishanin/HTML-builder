const fs = require('node:fs');
const path = require('node:path');

const assetsSourceDir = path.resolve(__dirname, 'assets');
const assetsDestinationDir = path.resolve(__dirname, 'project-dist', 'assets');

const stylesSourceDir = path.resolve(__dirname, 'styles');
const stylesDestinationDir = path.resolve(__dirname, 'project-dist');

const htmlSourceDir = path.resolve(__dirname, 'components');
const htmlDestinationDir = stylesDestinationDir;
const htmlTemplatePath = path.resolve(__dirname, 'template.html');

copyDirRecursive(assetsSourceDir, assetsDestinationDir);
mergeStyles(stylesSourceDir, stylesDestinationDir);
assembleHTML(htmlSourceDir, htmlDestinationDir, htmlTemplatePath);

async function copyDirRecursive(source, destination) {
  let isDestinationDirExists = false;

  await fs.promises.mkdir(destination, { recursive: true }).then((path) => {
    //console.log('PATH', path);
    if (!path) isDestinationDirExists = true;
  });

  const sourceDirEntities = await fs.promises.readdir(source, {
    encoding: 'utf-8',
    withFileTypes: true,
  });

  //console.log('sourceDirEntities', sourceDirEntities);

  const sourceFilenames = [];

  for (let entity of sourceDirEntities) {
    if (entity.isDirectory()) {
      //console.log('entity', entity);
      let newSource = path.resolve(source, entity.name);
      let newDist = path.resolve(destination, entity.name);
      copyDirRecursive(newSource, newDist);
    } else if (entity.isFile()) {
      sourceFilenames.push(entity.name);
    }
  }

  // delete files from destination if there no such files in source
  if (isDestinationDirExists) {
    const destDirEntities = await fs.promises.readdir(destination, {
      encoding: 'utf-8',
      withFileTypes: true,
    });

    const distFilenames = destDirEntities
      .filter((entity) => entity.isFile())
      .map((entity) => entity.name);

    distFilenames.forEach((filename) => {
      if (!sourceFilenames.includes(filename)) {
        fs.promises.unlink(path.resolve(destination, filename)); // remove excess file
      }
    });
  }

  //console.log('sourceFilenames', sourceFilenames);

  if (sourceFilenames.length > 0) {
    for (let fileName of sourceFilenames) {
      const from = path.resolve(source, fileName);
      const to = path.resolve(destination, fileName);
      try {
        await fs.promises.copyFile(from, to);
      } catch (error) {
        console.error('ERROR: ', error);
      }
    }
  }
}

async function mergeStyles(sourceDir, destinationDir) {
  const stylesDirEntities = await fs.promises.readdir(sourceDir, {
    encoding: 'utf-8',
    withFileTypes: true,
  });

  const stylesDirFilenames = stylesDirEntities
    .filter((ent) => ent.isFile() && path.extname(ent.name) === '.css')
    .map((ent) => ent.name)
    .reverse();
  //console.log(stylesDirFilenames);

  const pathsToStyleFiles = stylesDirFilenames.map((filename) =>
    path.resolve(sourceDir, filename)
  );

  const readableStylesStreams = pathsToStyleFiles.map((path) =>
    fs.createReadStream(path, 'utf-8')
  );

  let writableStyleStream = fs.createWriteStream(
    path.resolve(destinationDir, 'style.css'),
    'utf-8'
  );

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

async function assembleHTML(sourceDir, destinationDir, templatePath) {
  // const templateRead = fs.createReadStream(templatePath, 'utf-8');
  let htmlTemplate = await fs.promises.readFile(templatePath, {
    encoding: 'utf8',
  });
  //console.log(htmlTemplate);
  const templateTagsNames = getTemplateTagsNames(htmlTemplate);
  const htmlComponentsMap = await createHtmlContentMap(sourceDir);
  const html = injectHTML(htmlComponentsMap, templateTagsNames, htmlTemplate);
  //console.log(html);
  await fs.promises.writeFile(path.resolve(destinationDir, 'index.html'), html);
}

function getTemplateTagsNames(htmlLikeString) {
  const tagsNames = [...htmlLikeString.matchAll(/\{\{(\w+)\}\}/g)].map(
    (match) => match[1]
  );
  // console.log(tagsNames);
  return tagsNames;
}

async function createHtmlContentMap(sourceDir) {
  const htmlComponentsMap = new Object();

  const dirEntities = await fs.promises.readdir(sourceDir, {
    encoding: 'utf-8',
    withFileTypes: true,
  });

  const htmlComponentsNames = dirEntities
    .filter(
      (entity) => entity.isFile() && path.extname(entity.name) === '.html'
    )
    .map((entity) => entity.name);

  // console.log(htmlComponentsNames);
  for (let componentName of htmlComponentsNames) {
    htmlComponentsMap[componentName] = await fs.promises.readFile(
      path.resolve(sourceDir, componentName),
      'utf-8'
    );
  }
  return htmlComponentsMap;
  //console.log(htmlComponentsMap);
}

function injectHTML(htmlMap, tagNamesArray, htmlTemplate) {
  let resultingString = htmlTemplate;
  tagNamesArray.forEach((tagName) => {
    const replacement = htmlMap[tagName + '.html']
      ? htmlMap[tagName + '.html']
      : `\n{{${tagName}}}\n`;
    resultingString = resultingString.replace(`{{${tagName}}}`, replacement);
  });
  return resultingString;
}
