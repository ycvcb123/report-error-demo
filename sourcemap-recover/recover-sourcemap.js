const fs = require('fs');
const { hideBin } = require('yargs/helpers');
const { SourceMapConsumer } = require('source-map');
const _ = require('lodash');

const array = hideBin(process.argv);
const { line, column } = _.fromPairs(array.map(item => item.split('=')));

const sourcemapData = fs.readFileSync('./dist/bundle.js.map').toString();
const sourcemapConsumer = new SourceMapConsumer(sourcemapData, null, 'webpack://parse-sourcemap/');

const compressedLine = Number(line);
const compressedColumn = Number(column);

sourcemapConsumer.then(consumer => {
  const originalPosition = consumer.originalPositionFor({
    line: compressedLine,
    column: compressedColumn
  });

  const { source, line: originalLine, column: originalColumn } = originalPosition;

  console.log(`压缩后代码位置：行 ${compressedLine}，列 ${compressedColumn}`);

  if (source) {
    console.log(`原始源文件：${source}`);
    console.log(`原始源文件行号：${originalLine}`);

    const sourceContent = consumer.sourceContentFor(source);
    if (sourceContent) {
      const lines = sourceContent.split('\n');
      const codeLine = lines[originalPosition.line - 1];
      console.log('出问题代码行 -> Code line:', codeLine);
    }
    
  } else {
    console.log('无法找到原始源文件位置。');
  }
});