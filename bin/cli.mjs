#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import open from 'open';
// import { fileURLToPath } from 'url';

/**
 * @description start server
 */
import { start, file } from "../src/index.mjs";

const initCommand = process.argv[2];
const openCommand = process.argv[3];

process.env.QJS_ROOTDIR = process.env.QJS_ROOTDIR || 'functions';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const template = `// @see https://github.com/allmors/qjs/
import qjs from 'fast-qjs/core';

export default async function (params, ctx) {
    const User = await qjs.db.collection('user');
    const user = await User.insertOne({ name: "Sam", email: 'sam@codingsamrat.com' })

    // or 

    // const User = await this.db.collection('user');
    // ......

    return ctx.reply.send({
        message: 'Hello from qjs API',
        method: ctx.method,
        result: {
            ...user
        }
    });
}
`;

// function copyDirectory(sourceDir, targetDir) {
//     // 如果目标目录不存在或为空，才进行复制
//     if (!fs.existsSync(targetDir) || fs.readdirSync(targetDir).length === 0) {
//         if (!fs.existsSync(targetDir)) {
//             fs.mkdirSync(targetDir, { recursive: true });
//         }

//         const items = fs.readdirSync(sourceDir);

//         for (const item of items) {
//             const sourceItemPath = path.join(sourceDir, item);
//             const targetItemPath = path.join(targetDir, item);

//             const stats = fs.statSync(sourceItemPath);

//             if (stats.isDirectory()) {
//                 copyDirectory(sourceItemPath, targetItemPath);
//             } else {
//                 fs.copyFileSync(sourceItemPath, targetItemPath);
//             }
//         }
//     } else {
//         console.info('Target directory already exists and is not empty. Skipping copy.');
//     }
// }

// const aProjectPluginsPath = path.resolve(__dirname, '../plugins');
// const bProjectPluginsPath = path.resolve(process.cwd(), 'plugins');

// copyDirectory(aProjectPluginsPath, bProjectPluginsPath);

if (initCommand === '--init') {
    if (!fs.existsSync(process.env.QJS_ROOTDIR)) {
        fs.mkdirSync(process.env.QJS_ROOTDIR);
        const qjsFile = path.join(process.env.QJS_ROOTDIR, 'qjs.mjs');
        fs.writeFileSync(qjsFile, template);
    }
}

await start();

if ((fs.existsSync(file('qjs.js')) || fs.existsSync(file('qjs.mjs'))) && openCommand === '--open') {
    open(`http://localhost:${process.env.QJS_PORT}${process.env.QJS_PREFIX}/qjs`);
}