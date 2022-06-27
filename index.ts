import fastifyCookie from "@fastify/cookie";
import fastifySessionPlugin from "@fastify/session";
import fastify from "fastify";
import crypto from "crypto";
import ms from "ms";
import MongoStore from "connect-mongo";
import { MongoMemoryServer } from "mongodb-memory-server";
import fastifyHelmet from "@fastify/helmet";

declare module "fastify" {
  interface Session {
    hello?: string;
  }
}

(async () => {
  const server = fastify();

  const mongod = await MongoMemoryServer.create();

  /**
   * It will start working if you remove helmet or session store
   */
  // Remove me
  server.register(fastifyHelmet);

  server.register(fastifyCookie);
  server.register(fastifySessionPlugin, {
    secret: crypto.randomBytes(64).toString("hex"),
    cookie: {
      secure: false,
      maxAge: ms("5m"),
    },
    // Or remove me
    store: MongoStore.create({
      mongoUrl: mongod.getUri(),
      collectionName: "_sessions",
    }),
  });

  server.get("/session", async (request, reply) => {
    request.session.hello = "world";

    reply.redirect("/session/test");

    // Fix from mcollina
    return reply;
  });

  server.get("/session/test", async (request, reply) => {
    reply.send(request.session.hello);
  });

  await server.listen({ port: 3000 });

  console.log("Listening on http://localhost:3000");
})();
