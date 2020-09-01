import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Posts";
import mikroConfig from "./mikro-orm.config";

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  console.log(orm.em);

  const post = orm.em.create(Post, { title: "First post" });
  await orm.em.persistAndFlush(post);
};

main();
