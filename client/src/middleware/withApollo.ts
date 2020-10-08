import { ApolloClient, InMemoryCache } from "@apollo/client";
import { withApollo } from "next-apollo";
import { PaginatedPosts } from "../generated/graphql";

const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_API_URL as string,
  credentials: "include",
  // headers: {
  //   cookie:
  //     (typeof window === "undefined"
  //       ? ctx?.req?.headers.cookie
  //       : undefined) || "",
  // },
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          posts: {
            keyArgs: [],
            merge(
              existing: PaginatedPosts | undefined,
              incoming: PaginatedPosts
            ): PaginatedPosts {
              // console.log({ existing, incoming });
              return {
                ...incoming,
                posts: [...(existing?.posts || []), ...incoming?.posts],
              };
            },
          },
        },
      },
    },
  }),
});

export default withApollo(client);
