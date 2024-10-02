import path from 'path';
import fs from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { randomUUID } from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'url';
import mime from 'mime';

const pump = promisify(pipeline);
const uuidv4 = () => randomUUID({ disableEntropyCache: true });
class Files {
    constructor(collection) {
        this.collection = collection;
    }

    async upload(fileObj, options = {}) {
        // Ensure the 'uploads' directory is created once
        const baseUploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(baseUploadDir)) {
            fs.mkdirSync(baseUploadDir, { recursive: true });
        }

        // Generate a unique path for each upload
        const uniqueDir = uuidv4().substring(0, 16) + '-' + Date.now();
        const upPath = path.join(baseUploadDir, uniqueDir);

        const fPath = () => {
            if (!fs.existsSync(upPath)) {
                fs.mkdirSync(upPath, { recursive: true });
            }
            return upPath;
        };

        const filePath = path.join(fPath(), fileObj.filename);
        const writeStream = fs.createWriteStream(filePath);

        // Pump the content stream into the write stream
        await pump(fileObj.file, writeStream);

        const relativePath = path.relative(path.resolve(process.cwd()), filePath);
        const url = pathToFileURL(path.join('/', relativePath)).toString().replace('file://', '');
        const addOptions = options.addOptions || {};
        const fileData = {
            url,
            name: path.basename(filePath),
            type: options.type || mime.getType(filePath),
            size: fs.statSync(filePath).size,
            ...addOptions
        };
        
        return await this.collection.create(fileData);
    }

    async delete(params = {}) {
        const fileRecord = await this.collection.findById(params._id);
        if (fileRecord) {
            let filepath = fileURLToPath(`file://${fileRecord.url}`);
            filepath = path.resolve(process.cwd(), filepath.slice(1));
            fs.unlinkSync(filepath);
            fs.rmSync(path.dirname(filepath), { recursive: true });
            return await this.collection.findByIdAndDelete(params._id);
        }
        return null;
    }
}

export default Files;