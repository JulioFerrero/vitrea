import { QueryBuilder } from "./builder";
import type { QueryBuilderAPI, QueryResult } from "./types";

export type CmsFetchFn = (path: string, init?: RequestInit) => Promise<unknown>;
export interface CmsClient {
  query(collection: string): QueryBuilderAPI;
}

export function createCmsClient(api: { fetch: CmsFetchFn }): CmsClient {
  class RuntimeQueryBuilder extends QueryBuilder {
    override async execute(): Promise<QueryResult> {
      const spec = this.toJSON();
      const result = await api.fetch("/cms/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(spec),
      });
      return result as QueryResult;
    }
  }

  return {
    query(collection: string): QueryBuilderAPI {
      return new RuntimeQueryBuilder(collection);
    },
  };
}

export type { QueryBuilderAPI, QueryResult, QuerySpec } from "./types";
export { QueryBuilder } from "./builder";
