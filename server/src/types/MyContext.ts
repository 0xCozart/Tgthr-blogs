import { Request, Response } from "express";
import { Redis } from "ioredis";
import createUserLoader from "../utils/createUserLoader";
import createVoteLoader from "src/utils/createVoteLoader";

export type MyContext = {
  redis: Redis;
  req: Request & { session: Express.Session };
  res: Response;
  userLoader: ReturnType<typeof createUserLoader>;
  voteLoader: ReturnType<typeof createVoteLoader>;
};
