const { exec } = require('child_process');

// 定义要查看贡献者信息的文件路径
const filePath = 'path/to/your/file.js';
// 定义要定位的行号
const lineNumber = 42;



function getCodeOwner(filePath, lineNumber) {
    // 执行 git blame 命令，使用 -L 选项限制只输出指定行
    return new Promise((resolve,reject) => {
        exec(`git blame -L ${lineNumber},${lineNumber} ${filePath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`执行 git blame 命令时出错：${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`执行 git blame 命令时产生了错误输出：${stderr}`);
                return;
            }
        
            // 解析输出，提取贡献者信息
            const match = stdout.match(/\((.*?)\s+\d{4}-\d{2}-\d{2}/);
            if (match) {
                const contributor = match[1];
                console.log(`行号 ${lineNumber} 的开发者是：${contributor}`);
                resolve(contributor);
            } else {
                reject(`无法定位行号 ${lineNumber} 的开发者`);
            }
        });
    }) 
}

module.exports = {
    getCodeOwner
}