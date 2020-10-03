import { InMemoryCache, ApolloClient } from "@apollo/client";

const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_API_URL as string,
  cache: new InMemoryCache(),
});

export default client;
