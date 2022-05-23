const fs = require('fs');
const path = require('path');

const textFileName = 'enteredText.txt';
const pathToFile = path.resolve(__dirname, textFileName);
let isFileExists = false;
const exitMessage = `\nYour text is written to ${textFileName}, Bye!\n`;
let writeStream;

// check if 'enteredText.txt' exists. if not -> create new stream and file
fs.stat(pathToFile, (err, stats) => {
  if (stats) {
    isFileExists = true;
  } else {
    writeStream = fs.createWriteStream(pathToFile);
  }
});

process.stdout.write('Hi, enter your text: \n');

//add the text to existing file or create a new one and add the text
process.stdin.on('data', (text) => {
  text = text.toString();
  if (/^exit$/.test(text.trim())) {
    process.exit(exitMessage);
  } else {
    if (isFileExists) {
      fs.appendFile(pathToFile, text, (err) => {
        if (err) throw err;
      });
    } else {
      writeStream.write(text);
    }
  }
});

process.on('exit', (message) => process.stdout.write(message));
process.on('SIGINT', () => process.exit(exitMessage)); //if Ctrl + C
