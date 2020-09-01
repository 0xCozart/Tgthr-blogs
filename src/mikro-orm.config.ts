import { Post } from "./entities/Posts";
import { __prod__, DB_NAME, USER_NAME, PASSWORD } from "./constants";
import { MikroORM } from "@mikro-orm/core";
import path from "path";

export default {
  dbName: DB_NAME,
  user: USER_NAME,
  password: PASSWORD,
  entities: [Post],
  type: "postgresql",
  debug: !__prod__,
  migrations: {
    path: path.resolve(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
} as Parameters<typeof MikroORM.init>[0];

// Parameters<typeof MikroORM.init>[0] creates type safety for the
// first parameter of MikroORM.init().
