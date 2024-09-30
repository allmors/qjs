/**
 * Static middleware
 * @see https://github.com/fastify/static
 */
import path from 'path';
import fs from 'fs';

const STATIC = process.env.QJS_STATIC || 'public';
const staticPath = path.join(process.cwd(), STATIC);

// check directory
if (!fs.existsSync(staticPath)) {
    fs.mkdirSync(staticPath, { recursive: true });
}

const filePath = path.join(staticPath, 'hello.txt');
const content = 'Hello Qjs';

// write file
fs.writeFileSync(filePath, content, 'utf8');

export default {
    root: staticPath,
    prefix: `/public/`,
    // constraints: { host: 'example.com' }
}