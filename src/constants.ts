import path from "path";
import dotenvSafe from "dotenv-safe";

dotenvSafe.config({
  path: path.resolve(__dirname, "..", ".env"),
  // For some reason dotenv-safe requires an example field...
  example: path.resolve(__dirname, "..", ".env.example"),
});

export const { USER_NAME, PASSWORD, DB_NAME } = <{ [key: string]: string }>(
  process.env
);

export const __prod__ = process.env.NODE_ENV === "production";
