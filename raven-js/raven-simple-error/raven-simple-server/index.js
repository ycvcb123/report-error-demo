const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { SourceMapConsumer } = require('source-map');
const { getCodeOwner } = require('./gitBlame');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/raven/api/reportError', (req, res) => {
  const { msg, stack } = req.body;

  // 构造报告对象
  const report = {
    [stack.event_id]: {
        msg, 
        stack
    }
  };

  // 将报告对象转换为 JSON 字符串
  const reportData = JSON.stringify(report);

//   // 将报告数据追加到文件中
//   fs.appendFile('./raven-simple-server/reports.txt', reportData + '\n', (err) => {
//     if (err) {
//       res.status(500).json({ error: 'Failed to save report' });
//     } else {
//       res.status(200).json({ message: 'Report saved successfully' });
//     }
//   });
    // 删除文件内容
    fs.writeFile('./raven-simple-server/reports.txt', '', (err) => {
        if (err) {
        res.status(500).json({ error: 'Failed to clear file' });
        } else {
        // 将报告数据追加到文件中
        fs.appendFile('./raven-simple-server/reports.txt', reportData + '\n', (err) => {
            if (err) {
            res.status(500).json({ error: 'Failed to save report' });
            } else {
            res.status(200).json({ message: 'Report saved successfully' });
            }
        });
        }
    });
});

app.get('/raven/api/getError', (req, res) => {
  const eventId = req.query.eventId;
  const msg = req.query.msg;

  fs.readFile('./raven-simple-server/reports.txt', 'utf8', async (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Failed to retrieve reports' });
    } else {
      const reports = data.trim().split('\n').map((report) => JSON.parse(report));

      if(!msg) {
        if(!eventId) {
            res.status(200).json(reports);
        }else {
            const report = reports.find(item => !!item[eventId]);
            res.status(200).json([report]);
        }

      }else {
        const errorMsgMatch = reports.find(item => Object.values(item)[0].msg === msg);
        const errorInfo = Object.values(errorMsgMatch)[0];
        const framesArray = errorInfo.stack.exception.values[0].stacktrace.frames;
        const sourceMapArray = framesArray.map(item => {
            const urlObject = new URL(item.filename);
            const fileName = urlObject.pathname.split('/').pop();    

            const mapFilePath = path.resolve(
              path.join(__dirname, "../dist/js/", fileName + ".map")
            );

            return {
                line: item.lineno,
                column: item.colno, 
                mapFilePath
            }
        });

        function formatData(data) {
            let sources = data.sources || [];
            const sourcesPathMap = {};
        
            sources.map(item => {
              if (item.indexOf(".vue") !== -1) {
                sourcesPathMap[item] = item;
              } else {
                sourcesPathMap[item.replace(/\.[\.\/]+/g, "")] = item;
              }
            });
        
            return sourcesPathMap;
        }

        const originalPositionList = sourceMapArray.map(async (item) => {
            const sourcemapData = fs.readFileSync(item.mapFilePath).toString();
            const sourcemapDataForJson = JSON.parse(sourcemapData);
            const sourcesPathMap = formatData(sourcemapDataForJson);
            const sourcemapConsumer = new SourceMapConsumer(sourcemapData, null, 'webpack://parse-sourcemap/');

           
            let originalPosition;
            let sourceContent;

            return sourcemapConsumer.then(async (consumer) => {
                originalPosition = consumer.originalPositionFor({
                    line: Number(item.line),
                    column: Number(item.column)
                });
    
                const { source, line: originalLine, column: originalColumn } = originalPosition;
                
                sourceContent = sourcemapDataForJson.sourcesContent[sourcemapDataForJson.sources.indexOf(sourcesPathMap[source])];
        
                console.log(`压缩后代码位置：行 ${item.line}，列 ${item.column}`);
                let owner;
                if (source) {
                    console.log(`原始源文件：${source}`);
                    console.log(`原始源文件行号：${originalLine}`);
                    const sourcePath = source.replace(/webpack:\/\/raven-simple-error\//, '');
                    // const analyzePath = path.resolve(__dirname, `${sourcePath}`);

                    if(!source.includes('node_modules')) {
                        owner = await getCodeOwner(sourcePath, Number(originalLine));
                    };
                   
                    if (sourceContent) {
                        const lines = sourceContent.split('\n');
                        const codeLine = lines[originalPosition.line - 1];
                        console.log('出问题代码行 -> Code line:', codeLine);
                    };
                    
                } else {
                    console.log('无法找到原始源文件位置。');
                }

                return Promise.resolve({
                    ...originalPosition,
                    sourceContent,
                    owner
                })
            });
        })

        res.send(await Promise.all(originalPositionList));
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});