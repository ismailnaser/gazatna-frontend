import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getCacheKey,
  invalidateApiCache,
  isCacheableGet,
  readApiCache,
  writeApiCache,
} from "../../src/lib/apiCache.ts";

test("only GET list endpoints are cacheable", () => {
  assert.equal(isCacheableGet("/parent/fees/", "GET"), true);
  assert.equal(isCacheableGet("/parent/fees/", "POST"), false);
  assert.equal(isCacheableGet("/auth/login/", "GET"), false);
});

test("read/write cache roundtrip and invalidation", () => {
  const key = getCacheKey("/parent/student/", "GET");
  writeApiCache(key, { id: 1 }, 60_000);
  assert.deepEqual(readApiCache(key), { id: 1 });
  invalidateApiCache("/parent/student");
  assert.equal(readApiCache(key), null);
});

test("expired entries are dropped", () => {
  const key = getCacheKey("/site-settings", "GET");
  writeApiCache(key, { ok: true }, -1);
  assert.equal(readApiCache(key), null);
});
