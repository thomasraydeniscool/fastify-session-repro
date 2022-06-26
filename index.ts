import fastifyCookie from "@fastify/cookie";
import fastifySessionPlugin from "@fastify/session";
import fastify from "fastify";
import crypto from "crypto";
import ms from "ms";
import MongoStore from "connect-mongo";
import { MongoMemoryServer } from "mongodb-memory-server";

declare module "fastify" {
  interface Session {
    hello?: string;
  }
}

(async () => {
  const server = fastify();

  const mongod = await MongoMemoryServer.create();

  server.register(fastifyCookie);
  server.register(fastifySessionPlugin, {
    secret: crypto.randomBytes(64).toString("hex"),
    cookie: {
      secure: false,
      maxAge: ms("5m"),
    },
    store: MongoStore.create({
      mongoUrl: mongod.getUri(),
      collectionName: "_sessions",
    }),
  });

  server.get("/session", {}, (request, reply) => {
    request.session.hello = "world";

    reply.redirect("https://google.com");
  });

  await server.listen({ port: 3000, host: "0.0.0.0" });

  console.log("Listening on port 3000");
})();
