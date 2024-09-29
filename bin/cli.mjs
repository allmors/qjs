#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import open from 'open';
/**
 * @description start server
 */
import { start, file } from "../src/index.mjs";

const command = process.argv[2];

process.env.QJS_ROOTDIR = process.env.QJS_ROOTDIR || 'functions';

const template = `// @see https://github.com/hideipnetwork/qjs/
// import qjs from '@hnet/qjs/core';

export default async function (params, ctx) {
    // const User = await qjs.db.collection('user');
    // const user = await User.insertOne({ name: "Sam", email: 'sam@codingsamrat.com' })

    // or 

    // const User = await this.db.collection('user');
    // ......

    return ctx.reply.send({
        message: 'Hello from qjs API',
        method: ctx.method,
        params: params
    });
}
`;

if (command === '--init') {
    if (!fs.existsSync(process.env.QJS_ROOTDIR)) {
        fs.mkdirSync(process.env.QJS_ROOTDIR);
        const helloFile = path.join(process.env.QJS_ROOTDIR, 'qjs.mjs');
        fs.writeFileSync(helloFile, template);
    }
}

await start();

if (fs.existsSync(file('qjs.js')) || fs.existsSync(file('qjs.cjs')) || fs.existsSync(file('qjs.mjs'))) {
    open(`http://localhost:${process.env.QJS_PORT}${process.env.QJS_PREFIX}qjs`);
}