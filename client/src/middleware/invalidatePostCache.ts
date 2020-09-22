import { Cache } from "@urql/exchange-graphcache";

function invalidatePostsCache(_cache: Cache) {
  const queryField = _cache.inspectFields("Query");
  const fieldInfos = queryField.filter((info) => info.fieldName === "posts");
  // invalidates over every pagination when createPost fires
  return fieldInfos.forEach((fi) => {
    _cache.invalidate("Query", "posts", fi.arguments || {});
  });
}

export default invalidatePostsCache;
