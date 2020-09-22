import { cacheExchange } from "@urql/exchange-graphcache";
import { dedupExchange, fetchExchange } from "urql";
import gql from "graphql-tag";
import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
  VoteMutationVariables,
} from "../generated/graphql";

import errorExchange from "../middleware/errorExchange";
import { cursorPagination } from "./cursorPagination";
import configuredUpdateQuery from "./configuredUpdateQuery";
import invalidatePostsCache from "./invalidatePostCache";

const urqlClient = (ssrExchange: any) => ({
  url: "http://localhost:5000/graphql",
  fetchOptions: {
    credentials: "include" as const,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      keys: {
        PaginatedPosts: () => null,
      },
      resolvers: {
        Query: {
          posts: cursorPagination(),
        },
      },
      updates: {
        Mutation: {
          login: (_result, _args, _cache, _info) => {
            configuredUpdateQuery<LoginMutation, MeQuery>(
              _cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.login.errors) return query;

                return { me: result.login.user };
              }
            );
            invalidatePostsCache(_cache);
            // const queryField = _cache.inspectFields("Query");
            // const fieldInfos = queryField.filter(
            //   (info) => info.fieldName === "posts"
            // );
            // // invalidates over every pagination when createPost fires
            // fieldInfos.forEach((fi) => {
            //   _cache.invalidate("Query", "posts", fi.arguments || {});
            // });
          },
          logout: (_result, _args, _cache, _info) => {
            configuredUpdateQuery<LogoutMutation, MeQuery>(
              _cache,
              { query: MeDocument },
              _result,
              () => ({ me: null })
            );
            invalidatePostsCache(_cache);
          },
          register: (_result, _args, _cache, _info) => {
            configuredUpdateQuery<RegisterMutation, MeQuery>(
              _cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.register.errors) return query;

                return { me: result.register.user };
              }
            );
          },
          createPost: (_result, _args, _cache, _info) => {
            const queryField = _cache.inspectFields("Query");
            const fieldInfos = queryField.filter(
              (info) => info.fieldName === "posts"
            );
            // invalidates over every pagination when createPost fires
            fieldInfos.forEach((fi) => {
              _cache.invalidate("Query", "posts", fi.arguments || {});
            });
          },
          vote: (_result, _args, _cache, _info) => {
            /*******************************************************
             * Really don't like the way this is done.              *
             * ~Get current points from cache using readFragment.   *
             * Then write to the cache sudo points to give the      *
             * effect of live updating, instead of being fed        *
             * through the backend.~                                *
             * Saves time and space complexity but I don't like it. *                     *
             * Looking for alternatives.                            *
             *******************************************************/

            const { postId, value } = _args as VoteMutationVariables;
            const data = _cache.readFragment(
              gql`
                fragment _ on Post {
                  id
                  points
                  voteStatus
                }
              `,
              { id: postId } as any
            );
            if (data) {
              if (data.voteStatus === value) return;
              console.log({ data, value, _cache });
              const newPoints =
                (data.points as number) + (!data.voteStatus ? 1 : 2) * value;
              _cache.writeFragment(
                gql`
                  fragment __ on Post {
                    id
                    points
                    voteStatus
                  }
                `,
                { id: postId, points: newPoints, voteStatus: value } as any
              );
            }
          },
        },
      },
    }),
    errorExchange,
    ssrExchange,
    fetchExchange,
  ],
});

export default urqlClient;
