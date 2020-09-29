import { Request, Response } from "express";
import { Redis } from "ioredis";
import createUserLoader from "../utils/createUserLoader";

export type MyContext = {
  redis: Redis;
  req: Request & { session: Express.Session };
  res: Response;
  userLoader: ReturnType<typeof createUserLoader>;
};
