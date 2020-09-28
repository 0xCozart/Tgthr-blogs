import { Cache } from "@urql/exchange-graphcache";

function invalidatePostsCache(_cache: Cache) {
  const allFields = _cache.inspectFields("Query");
  const fieldInfos = allFields.filter((info) => info.fieldName === "posts");
  fieldInfos.forEach((fi) => {
    _cache.invalidate("Query", "posts", fi.arguments || {});
  });
}

export default invalidatePostsCache;
