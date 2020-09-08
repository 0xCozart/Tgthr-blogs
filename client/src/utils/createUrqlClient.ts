import { dedupExchange, fetchExchange } from "urql";
import { cacheExchange } from "@urql/exchange-graphcache";

import { configuredUpdateQuery } from "./configuredUpdateQuery";
import {
  LoginMutation,
  MeQuery,
  MeDocument,
  RegisterMutation,
  LogoutMutation,
} from "../generated/graphql";

export const createUrqlClient = (ssrExchange: any) => ({
  url: "http://localhost:5000/graphql",
  fetchOptions: {
    credentials: "include" as const,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      updates: {
        Mutation: {
          login: (_result, args, cache, info) => {
            configuredUpdateQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.login.errors) return query;

                return { me: result.login.user };
              }
            );
          },
          register: (_result, args, cache, info) => {
            configuredUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.register.errors) return query;

                return { me: result.register.user };
              }
            );
          },
          logout: (_result, args, cache, info) => {
            configuredUpdateQuery<LogoutMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              () => ({ me: null })
            );
          },
        },
      },
    }),
    ssrExchange,
    fetchExchange,
  ],
});
