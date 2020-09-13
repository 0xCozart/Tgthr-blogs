import { Exchange } from "urql";
import { pipe, tap } from "wonka";
import Router from "next/router";

// allows use to handle errors globally
const errorExchange: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error?.message.includes("not authenticated")) {
        console.error("User not authenticated");
        Router.replace("/login");
      }
    })
  );
};

export default errorExchange;
