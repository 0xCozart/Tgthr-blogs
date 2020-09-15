import { stringifyVariables } from "@urql/core";
import { Resolver } from "@urql/exchange-graphcache";

export interface PaginationParams {
  cursorArgument?: string;
}

export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;

    // grabs all field in cache <posts, MeQuery>
    const allFields = cache.inspectFields(entityKey);

    // filters down to only <posts>
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);

    // edge case for 0 items returned
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    /*
     * These lines check if the current <post> query (with variables) results
     * are in the cache.
     *
     * If so sets the partial property on info to
     *
     *
     */
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isItInTheCache = cache.resolveFieldByKey(entityKey, fieldKey);
    info.partial = !isItInTheCache;

    // appends and returns result set
    const results: string[] = [];
    fieldInfos.forEach((fieldInfo) => {
      const data = cache.resolveFieldByKey(
        entityKey,
        fieldInfo.fieldKey
      ) as string[];
      results.push(...data);
    });
    // console.log({ results });

    return results;

    // const visited = new Set();
    // let result: NullArray<string> = [];
    // let prevOffset: number | null = null;

    // for (let i = 0; i < size; i++) {
    //   const { fieldKey, arguments: args } = fieldInfos[i];
    //   if (args === null || !compareArgs(fieldArgs, args)) {
    //     continue;
    //   }

    //   const links = cache.resolveFieldByKey(entityKey, fieldKey) as string[];
    //   const currentOffset = args[cursorArgument];

    //   if (
    //     links === null ||
    //     links.length === 0 ||
    //     typeof currentOffset !== "number"
    //   ) {
    //     continue;
    //   }

    //   if (!prevOffset || currentOffset > prevOffset) {
    //     for (let j = 0; j < links.length; j++) {
    //       const link = links[j];
    //       if (visited.has(link)) continue;
    //       result.push(link);
    //       visited.add(link);
    //     }
    //   } else {
    //     const tempResult: NullArray<string> = [];
    //     for (let j = 0; j < links.length; j++) {
    //       const link = links[j];
    //       if (visited.has(link)) continue;
    //       tempResult.push(link);
    //       visited.add(link);
    //     }
    //     result = [...tempResult, ...result];
    //   }

    //   prevOffset = currentOffset;
    // }

    // const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
    // if (hasCurrentPage) {
    //   return result;
    // } else if (!(info as any).store.schema) {
    //   return undefined;
    // } else {
    //   info.partial = true;
    //   return result;
    // }
  };
};
