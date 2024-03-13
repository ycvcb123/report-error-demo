const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 8081;

// 使用 CORS 中间件
app.use(cors({
  origin: 'http://127.0.0.1:8080'
}));

// 静态文件服务
app.use(express.static(path.resolve(__dirname, './js')));

// 启动服务器
app.listen(port, () => {
  console.log(`Express app listening at http://127.0.0.1:${port}`);
});