import path from "path";
import dotenvSafe from "dotenv-safe";

dotenvSafe.config({
  path: path.resolve(__dirname, "..", ".env"),
  // For some reason dotenv-safe requires an example field...
  example: path.resolve(__dirname, "..", ".env.example"),
});

export const {
  USER_NAME,
  PASSWORD,
  DB_NAME,
  REDIS_SESSION_SECRET,
  PORT,
  NODEMAILER_USER,
  NODEMAILER_PASS,
} = <{ [key: string]: string }>process.env;

export const __prod__ = process.env.NODE_ENV === "production";

// redis cookie name
export const COOKIE_NAME = "qid";

// redis prefix
export const FORGET_PASSWORD_PREFIX = "forget-password:";

// Days in miliseconds
export const ONE_DAY = 1000 * 60 * 60 * 24;
export const TWO_DAYS = 1000 * 60 * 60 * 24 * 2;
export const THREE_DAYS = 1000 * 60 * 60 * 24 * 3;
export const TEN_YEARS = 1000 * 60 * 60 * 24 * 365 * 10;
