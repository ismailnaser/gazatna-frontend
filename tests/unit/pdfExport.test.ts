import assert from "node:assert/strict";
import { test } from "node:test";

import { escapeHtml } from "../../src/lib/pdfExport.ts";

test("escapeHtml prevents markup injection", () => {
  assert.equal(escapeHtml('<img src=x onerror="alert(1)">'), "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
  assert.equal(escapeHtml("أ & ب"), "أ &amp; ب");
  assert.equal(escapeHtml(45), "45");
  assert.equal(escapeHtml(null), "");
});
