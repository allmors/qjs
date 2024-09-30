import Fastify from 'fastify';
import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import cors from '@fastify/cors';
import staticFile from "@fastify/static";
import multipart from '@fastify/multipart';

// custom
import corsPlugin from '../plugins/cors.mjs';
import staticPlugin from '../plugins/static.mjs';
import multipartPlugin from '../plugins/multipart.mjs';
import jwtPlugin from '../plugins/jwt.mjs';
import qjsCore from "../core/index.mjs"

const ROOTDIR = process.env.QJS_ROOTDIR || 'functions';
const PORT = process.env.QJS_PORT || 5173;
const PREFIX = process.env.QJS_PREFIX || '';

let fastify;
const routeHandlers = new Map();

// Initialize Fastify server
const initServer = async () => {
    fastify = Fastify();
    await fastify.register(cors, corsPlugin);
    await fastify.register(staticFile, staticPlugin);
    await fastify.register(multipart, multipartPlugin);
    await fastify.register(jwtPlugin, { secret: process.env.QJS_SECRET || 'QJS_SECRET', expiresIn: process.env.QJS_EXPIRESIN || '3d' });

    // Use decorator to add custom methods to fastify instance
    await fastify.decorate('db', qjsCore.db)
    await fastify.decorate('files', qjsCore.files)

    // Add a catch-all route to handle dynamic routes
    fastify.all(`${PREFIX || ''}/*`,
        // {
        //     onRequest: [fastify.authenticate]
        // },
        async (request, reply) => {
            // Handle when PREFIX is empty or not defined
            const url = new URL(request.url, `http://${request.headers.host}`);
            const pathWithoutPrefix = PREFIX ? url.pathname.slice(PREFIX.length) : url.pathname;

            // Bearer Token (Temporarily replace router options ==> onRequest)
            const authHeader = request.headers?.authorization;

            if (authHeader) {
                try {
                    const token = authHeader.replace('Bearer ', '');
                    request.user = token ? await fastify.jwt.verify(token) : null;
                } catch {
                    request.user = null;
                }
            } else {
                request.user = null;
            }

            for (const [route, handler] of routeHandlers.entries()) {
                const routeParams = matchRoute(route, pathWithoutPrefix);
                if (routeParams !== null) {
                    request.params = { ...request.params, ...routeParams };

                    // Handle file uploads
                    if (request.isMultipart()) {
                        const files = await request.file();
                        request.params.file = files; // Attach uploaded files to params
                    }

                    return handler(request, reply);
                }
            }

            reply.status(404).send({ error: 'Not Found' });
        });
};

// Parse file name to route
const parseRouteFromFilename = (filename) => {
    const routeParts = filename.replace(/\.(js|ts|mjs)$/, '').split('.');
    return '/' + routeParts.map(part => part.startsWith('_') ? `:${part.slice(1)}` : part).join('/');
};

// Match route and extract parameters
const matchRoute = (routePattern, url) => {
    const routeParts = routePattern.split('/');
    const urlParts = url.split('/');

    if (routeParts.length !== urlParts.length) {
        return null;
    }

    const params = {};
    for (let i = 0; i < routeParts.length; i++) {
        // If it's a dynamic parameter like ":id"
        if (routeParts[i].startsWith(':')) {
            params[routeParts[i].slice(1)] = urlParts[i];
        } else if (routeParts[i] !== urlParts[i]) {
            // Non-matching part, return null
            return null;
        }
    }

    // Remove any potential '*' parameter from the params object
    if (params['*']) {
        delete params['*'];
    }

    return params;
};

// Handler function in loadRoute
const loadRoute = async (fullPath, baseRoute) => {
    const route = path.join(baseRoute, parseRouteFromFilename(path.basename(fullPath)));
    // Remove any double slashes and ensure there's a leading slash
    const normalizedRoute = '/' + route.split('/').filter(Boolean).join('/');

    try {
        const apiModule = await import(`${fullPath}?update=${Date.now()}`);
        const apiFunction = apiModule.default;

        if (typeof apiFunction === 'function') {
            const handler = async (request, reply) => {
                const params = {
                    ...request.params,
                    ...request.query,   // For GET requests
                    ...request.body,     // For POST/PUT requests
                };
                const context = {
                    ...request,
                    method: request.method,
                    headers: request.headers,
                    reply: reply
                };

                // Remove any extraneous '*' parameters in final response if they exist
                if (params['*']) {
                    delete params['*'];
                }

                await apiFunction.call(fastify, params, context);
            };

            routeHandlers.set(normalizedRoute, handler);
            console.log(`Route updated: ${PREFIX}${normalizedRoute}`);
        } else {
            console.error(`Error: The exported function in ${fullPath} is not a valid function.`);
        }
    } catch (err) {
        console.error(`Error loading ${fullPath}:`, err);
    }
};


// Load routes recursively
const loadRoutesRecursively = async (dir, baseRoute = '') => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            if (entry.name.startsWith('(') && entry.name.endsWith(')')) {
                await loadRoutesRecursively(fullPath, baseRoute);
            } else {
                await loadRoutesRecursively(fullPath, path.join(baseRoute, entry.name));
            }
        } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.ts') || entry.name.endsWith('.mjs'))) {
            await loadRoute(fullPath, baseRoute);
        }
    }
};

// Watch for file changes
const watchFiles = (dir) => {
    chokidar.watch(dir, { ignoreInitial: true }).on('change', async (filePath) => {
        console.log(`File changed: ${filePath}. Reloading route...`);
        const relativePath = path.relative(path.join(process.cwd(), ROOTDIR), filePath);
        const baseRoute = path.dirname(relativePath);
        await loadRoute(filePath, baseRoute);
    });
};

// Start server
const startServer = async () => {
    try {
        await fastify.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`Server is running at http://0.0.0.0:${PORT}`);
    } catch (err) {
        console.error('Error starting server:', err);
        process.exit(1);
    }
};

// Main start function
const start = async () => {
    await initServer();
    await loadRoutesRecursively(path.join(process.cwd(), ROOTDIR));
    await startServer();
    watchFiles(path.join(process.cwd(), ROOTDIR));
};

const file = (qjs) => path.resolve('.', process.env.QJS_ROOTDIR, qjs);

export { start, file };
