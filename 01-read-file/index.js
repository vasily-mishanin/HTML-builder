// https://github.com/vasily-mishanin/HTML-builder

console.log('TASK 01-read-file');
const fs = require('fs');
const path = require('path');
const textFilePath = path.resolve(__dirname, 'text.txt');

const textReadableStream = fs.createReadStream(textFilePath, 'utf-8');
let text = '';
textReadableStream.on('data', (chunk) => {
  text += chunk.toString();
});
textReadableStream.on('end', () => process.stdout.write(text));
textReadableStream.on('error', (error) => console.error(error));
