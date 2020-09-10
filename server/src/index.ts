// Express
import express from "express";

//MikroORM for PostgreSQL
import { MikroORM } from "@mikro-orm/core";
import {
  __prod__,
  REDIS_SESSION_SECRET,
  PORT,
  COOKIE_NAME,
  TEN_YEARS,
} from "./constants";
import mikroConfig from "./mikro-orm.config";

// Graphql
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import "reflect-metadata";

// Graphql resolvers
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

// Redis
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";

// Cors
import cors from "cors";

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();

  redis
    .on("error", (err) => {
      console.log("Redis error: ", err);
    })
    .on("message", (message) => {
      console.log("Redis message: ", message);
    });

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: TEN_YEARS, // 10 years because why not
        httpOnly: true,
        secure: __prod__, //cookie only work in https
        sameSite: "lax", // csrf
      },
      saveUninitialized: false,
      secret: REDIS_SESSION_SECRET,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ em: orm.em, req, res, redis }),
  });

  apolloServer.applyMiddleware({
    app,
    // Apollo auto sets cors origin to "*",
    // just imported cors and set origin manually
    cors: false,
  });

  app.listen(PORT, () => {
    console.log("server started on localhost: " + PORT);
  });
};

main().catch((err) => console.error(err));
