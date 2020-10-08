import { InMemoryCache, ApolloClient } from "@apollo/client";
import {  PaginatedPosts } from "../generated/graphql";
import { withApollo as createWithApollo} from 'next-apollo'


const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_API_URL as string,
  credentials: "include",
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          posts: {
            keyArgs: [],
            merge(existing: PaginatedPosts | undefined, incoming: PaginatedPosts) : PaginatedPosts{
              return {
                ...incoming,
                posts: [...(existing?.posts || []), ...incoming.posts]
              }
            }
          }
        }
      }
    },
  }),
});


const withApollo = createWithApollo(client)

export default withApollo;

