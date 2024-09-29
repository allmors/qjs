/**
 * Static middleware
 * @see https://github.com/fastify/static
 */

import path from 'path';

const STATIC = 'public';
const __dirname = path.dirname(path.join(process.cwd(), STATIC));

export default {
    root: path.join(`${__dirname}/${STATIC}`, `../public`),
    prefix: `/public/`,
    // constraints: { host: 'example.com' }
}