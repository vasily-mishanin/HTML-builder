const path = require('path');
const fs = require('fs');
const pathTargetDir = path.resolve(__dirname, 'secret-folder');

const getFiles = async (dirPath) => {
  try {
    const filesData = [];
    const dirEntities = await fs.promises.readdir(dirPath, {
      encoding: 'utf-8',
      withFileTypes: true,
    });
    for (let dirEntity of dirEntities) {
      if (dirEntity.isFile()) {
        let pathToEntity = path.resolve(dirPath, dirEntity.name);
        let fileFullName = dirEntity.name;
        const fileExtention = path.extname(dirEntity.name);
        const fileName = path.basename(dirEntity.name, fileExtention);
        fs.stat(pathToEntity, (err, stats) => {
          let entry = `${fileName} - ${fileExtention.slice(1)} - ${
            stats.size / 1000
          }kB`;
          filesData.push(entry);
          console.log(entry);
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
};

getFiles(pathTargetDir);
