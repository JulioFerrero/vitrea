import { QueryBuilder } from "./builder";
import type { QueryResult } from "./types";

export type CmsFetchFn = (path: string, init?: RequestInit) => Promise<unknown>;

export function createCmsClient(api: { fetch: CmsFetchFn }) {
  class RuntimeQueryBuilder extends QueryBuilder {
    async execute(): Promise<QueryResult> {
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
    query(collection: string): RuntimeQueryBuilder {
      return new RuntimeQueryBuilder(collection);
    },
  };
}

export type { QueryResult, QuerySpec } from "./types";
export { QueryBuilder } from "./builder";
