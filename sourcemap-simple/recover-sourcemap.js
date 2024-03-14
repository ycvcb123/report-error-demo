// const fs = require('fs');
// const SourceMap = require('source-map');

// let data = fs.readFileSync('./dist/bundle.js.map').toString();
// // const sourceMapConsumer = new SourceMap.SourceMapConsumer(data);
// const sourceMapConsumer = new SourceMap.SourceMapConsumer(data);

// sourceMapConsumer.then(consumer => {
//   const line = 1, column = 1;
//   const originalPosition = consumer.originalPositionFor({ line, column });
//   // 从源代码位置中获取原始源代码
//   const { source, line: originalLine, column: originalColumn } = originalPosition;
//   // const originalCode = consumer.sourceContentFor(source);

//   console.log(`压缩后代码位置：行 ${line}，列 ${column}`);
//   console.log(`原始源代码位置：${source}:${originalLine}:${originalColumn}`);
//   console.log('source', source);
//   // console.log('原始源代码：', originalCode);

//   // if (source) {
//   //   const sourceContent = consumer.sourceContentFor(source);
//   //   if (sourceContent) {
//   //     const lines = sourceContent.split('\n');
//   //     const codeLine = lines[originalPosition.line - 1];
//   //     console.log('出问题代码行 -> Code line:', codeLine);
//   //   }
//   // }

 
// })



const fs = require('fs');
const { SourceMapConsumer } = require('source-map');

const sourcemapData = fs.readFileSync('./dist/bundle.js.map').toString();
const sourcemapConsumer = new SourceMapConsumer(sourcemapData, null, 'webpack://parse-sourcemap/');

const compressedLine = 1;
const compressedColumn = 94;

sourcemapConsumer.then(consumer => {
  const originalPosition = consumer.originalPositionFor({
    line: compressedLine,
    column: compressedColumn
  });

  const { source, line: originalLine, column: originalColumn } = originalPosition;

  console.log('originalPosition::', originalPosition);

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