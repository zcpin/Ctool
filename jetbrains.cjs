// web-to-idea-plugin.js
const { join } = require("path");
const { existsSync, mkdirSync, rmSync, copyFileSync } = require("fs");
const extractZip = (zipPath, extractPath) => {
    return new Promise((resolve, reject) => {
        // 确保解压目录存在
        if (!existsSync(extractPath)) {
            mkdirSync(extractPath, { recursive: true });
        }

        // 使用 node-stream-zip 来解压文件
        const StreamZip = require('node-stream-zip');
        const zip = new StreamZip.async({ file: zipPath });

        zip.extract(null, extractPath)
            .then(() => {
                zip.close().then(r => {
                    resolve();
                });
                resolve();
            })
            .catch((err) => {
                zip.close().then(r => {
                    resolve();
                });
                reject(err);
            });
    });
};

const run = async () => {
    // 配置参数
    const sourceZipPath = join(__dirname, "_release", "ctool_web.zip"); // 源压缩包路径
    const targetDir = join(__dirname, "..","..","Java", "Ctool", "src", "main", "resources", "html"); // IDEA插件目标目录

    try {
        // 1. 检查源压缩包是否存在
        if (!existsSync(sourceZipPath)) {
            console.error(`源压缩包 "${sourceZipPath}" 不存在`);
            process.exit(1);
        }

        // 2. 清空目标目录
        if (existsSync(targetDir)) {
            rmSync(targetDir, { recursive: true, force: true });
            console.log(`已清空目标目录: ${targetDir}`);
        }

        // 3. 确保目标目录存在
        mkdirSync(targetDir, { recursive: true });

        // 4. 复制压缩包到目标目录
        const targetZipPath = join(targetDir, "web.zip");
        copyFileSync(sourceZipPath, targetZipPath);
        console.log(`已复制压缩包到: ${targetZipPath}`);

        // 5. 解压文件
        await extractZip(targetZipPath, targetDir);
        console.log(`已解压文件到: ${targetDir}`);

        // 6. 删除临时压缩包
        rmSync(targetZipPath, { force: true });
        console.log(`已删除临时压缩包: ${targetZipPath}`);
    } catch (error) {
        console.error("操作失败:", error.message);
        process.exit(1);
    }
};

// 检查是否直接运行此脚本
if (require.main === module) {
    run().then(r => {
        console.log("操作完成！");
    })
}

module.exports = { run };
