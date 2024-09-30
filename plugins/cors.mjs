/**
 * CORS middleware
 * @see https://github.com/fastify/fastify-cors
 */
export default {
    hook: 'preHandler',
    delegator: (req, callback) => {
        const corsOptions = {
            // This is NOT recommended for production as it enables reflection exploits
            origin: true
        };

        // do not include CORS headers for requests from localhost
        if (/^localhost$/m.test(req.headers.origin)) {
            corsOptions.origin = false
        }

        // callback expects two parameters: error and options
        callback(null, corsOptions)
    },
}