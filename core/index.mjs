import FileXdb from 'qjs-db'
import path from 'path'
import Files from './file.mjs'

const ROOTDIR = process.env.QJS_ROOTDIR || 'functions';
// Initiate database
const __dirname = path.dirname(path.join(process.cwd(), ROOTDIR));

const db = new FileXdb(`${__dirname}/db/qjs.db`)

const files = new Files(await db.collection('_files'));

export default {
    db,
    files
}