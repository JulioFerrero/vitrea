import type { FilterOp, WhereClause, IncludeClause, QuerySpec, QueryResult } from "./types";

export class QueryBuilder {
  private _collection: string;
  private _where: WhereClause[] = [];
  private _select: string[] | undefined;
  private _orderBy: { field: string; dir: "asc" | "desc" } | undefined;
  private _include: IncludeClause[] = [];
  private _limit: number | undefined;
  private _offset: number | undefined;

  constructor(collection: string) {
    this._collection = collection;
  }

  where(field: string, op: FilterOp, value: unknown): this {
    this._where.push({ field, op, value });
    return this;
  }

  select(fields: string[]): this {
    this._select = fields;
    return this;
  }

  include(field: string, fn: (q: QueryBuilder) => QueryBuilder): this {
    const subBuilder = new QueryBuilder("__sub__");
    const built = fn(subBuilder);
    const subSpec: IncludeClause = {
      field,
      select: built._select,
    };
    if (built._include.length > 0) {
      subSpec.include = built._include;
    }
    this._include.push(subSpec);
    return this;
  }

  orderBy(field: string, dir: "asc" | "desc" = "asc"): this {
    this._orderBy = { field, dir };
    return this;
  }

  limit(n: number): this {
    this._limit = n;
    return this;
  }

  offset(n: number): this {
    this._offset = n;
    return this;
  }

  toJSON(): QuerySpec {
    const spec: QuerySpec = { collection: this._collection };
    if (this._where.length > 0) spec.where = this._where;
    if (this._select) spec.select = this._select;
    if (this._include.length > 0) spec.include = this._include;
    if (this._orderBy) spec.orderBy = this._orderBy;
    if (this._limit != null) spec.limit = this._limit;
    if (this._offset != null) spec.offset = this._offset;
    return spec;
  }

  execute(): Promise<QueryResult> {
    throw new Error("QueryBuilder.execute() must be overridden by server or client implementation");
  }
}
