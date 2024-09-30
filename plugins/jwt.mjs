/**
 * JWT middleware
 * @see https://github.com/fastify/fastify-jwt
 */
import jwt from '@fastify/jwt';
import fastifyPlugin from 'fastify-plugin';

export let fastifyCore;

const jwtPlugin = async (fastify, options) => {
    await fastify.register(jwt, {
        secret: options.secret,
        expiresIn: options.expiresIn,
    });

    fastify.decorate('authenticate', async function (request, reply) {
        try {
            await request.jwtVerify()
        } catch (err) {
            reply.send(err);
        }
    });

    fastifyCore = fastify;
};

const qsjJwtPlugin = fastifyPlugin(jwtPlugin);

export default qsjJwtPlugin