import { createCmsClient } from "./index";

let _client: ReturnType<typeof createCmsClient> | null = null;

function defaultFetch(path: string, init?: RequestInit): Promise<unknown> {
  return fetch(path, init).then((r) => r.json());
}

function getClient(): ReturnType<typeof createCmsClient> {
  if (!_client) {
    _client = createCmsClient({ fetch: defaultFetch });
  }
  return _client;
}

export function query(collection: string) {
  return getClient().query(collection);
}

export { createCmsClient } from "./index";
export type { QueryResult, QuerySpec, CmsFetchFn } from "./index";
