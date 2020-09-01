import { Post } from "./entities/Posts";
import { __prod__, DB_NAME, USER_NAME, PASSWORD } from "./constants";

export default {
  dbName: DB_NAME,
  user: USER_NAME,
  password: PASSWORD,
  entities: [Post],
  type: "postgresql",
  debug: !__prod__,
} as const;
