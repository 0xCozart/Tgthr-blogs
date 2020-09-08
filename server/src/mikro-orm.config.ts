import path from "path";
import { __prod__, DB_NAME, USER_NAME, PASSWORD } from "./constants";

import { MikroORM } from "@mikro-orm/core";
import { User } from "./entities/User";
import { Post } from "./entities/Post";

export default {
  dbName: DB_NAME,
  user: USER_NAME,
  password: PASSWORD,
  entities: [Post, User],
  type: "postgresql",
  debug: !__prod__,
  migrations: {
    path: path.resolve(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
} as Parameters<typeof MikroORM.init>[0];
