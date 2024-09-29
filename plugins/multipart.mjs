/**
 * Multipart middleware
 * @see https://github.com/fastify/fastify-multipart
 */
export default {
    limits: {
        fieldNameSize: 100, // Max field name size in bytes
        fieldSize: 100,     // Max field value size in bytes
        fields: 10,         // Max number of non-file fields
        fileSize: 10000000,  // For multipart forms, the max file size in bytes
        files: 1,           // Max number of file fields, Currently only supports single file
        headerPairs: 2000,  // Max number of header key=>value pairs
        parts: 1000         // For multipart forms, the max number of parts (fields + files)
    }
}