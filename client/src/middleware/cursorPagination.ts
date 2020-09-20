import { stringifyVariables } from "@urql/core";
import { Resolver } from "@urql/exchange-graphcache";

export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    // grabs all field in cache: current auto queries = <posts, MeQuery>
    const allFields = cache.inspectFields(entityKey);

    // filters down to only <posts>
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);

    // edge case for 0 items returned
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }
    ///////////////////////////////////////////////////////////////////////////h
    /*
     * Checks if the current <post> query (with variables) results
     * are in the cache.
     *
     * If in cache, sets partial to false.
     */
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isItInTheCache = cache.resolve(
      cache.resolveFieldByKey(entityKey, fieldKey) as string,
      "posts"
    );
    info.partial = !isItInTheCache;
    ////////////////////////////////////////////////////////////////////////////

    let hasMore = true;
    // appends and returns result set
    const results: string[] = [];
    fieldInfos.forEach((fieldInfo) => {
      const key = cache.resolveFieldByKey(
        entityKey,
        fieldInfo.fieldKey
      ) as string;

      const responsePosts = cache.resolve(key, "posts") as string[];
      const responseHasMore = cache.resolve(key, "hasMore") as boolean;

      if (!responseHasMore) {
        hasMore = responseHasMore;
      }

      results.push(...responsePosts);
    });

    return { __typename: "PaginatedPosts", hasMore, posts: results };
  };
};
