export type FilterOp =
  | "==" | "!=" | "<" | ">" | "<=" | ">="
  | "in" | "nin" | "contains" | "startsWith" | "endsWith";

export interface WhereClause {
  field: string;
  op: FilterOp;
  value: unknown;
}

export interface IncludeClause {
  field: string;
  select?: string[];
  include?: IncludeClause[];
}

export interface QuerySpec {
  collection: string;
  where?: WhereClause[];
  select?: string[];
  orderBy?: { field: string; dir: "asc" | "desc" };
  include?: IncludeClause[];
  limit?: number;
  offset?: number;
}

export interface QueryResult<T = Record<string, unknown>> {
  items: T[];
  total: number;
}

export interface QueryBuilderAPI<T = Record<string, unknown>> {
  where(field: string, op: FilterOp, value: unknown): this;
  select(fields: string[]): this;
  include(field: string, fn: (q: QueryBuilderAPI) => QueryBuilderAPI): this;
  orderBy(field: string, dir: "asc" | "desc"): this;
  limit(n: number): this;
  offset(n: number): this;
  toJSON(): QuerySpec;
  execute(): Promise<QueryResult<T>>;
}
