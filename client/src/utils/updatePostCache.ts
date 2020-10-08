import { ApolloCache } from "@apollo/client";

export default (cache: ApolloCache<any>) => {
  cache.evict({ fieldName: "posts:{}" });
};
