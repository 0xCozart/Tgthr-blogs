import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";

const __main__ = async () => {
  const orm = await MikroORM.init({
    dbName: "tgthr_db",
    type: "postgresql",
    debug: !__prod__,
  });
};

__main__();
