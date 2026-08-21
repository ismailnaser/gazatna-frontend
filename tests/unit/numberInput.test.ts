import assert from "node:assert/strict";
import { test } from "node:test";

import { applyNumberKey, isValidNumberDraft, validateFinalNumber } from "../../src/lib/numberInput.ts";

test("integer drafts reject decimals", () => {
  assert.equal(isValidNumberDraft("12", { min: 0, max: 100 }), true);
  assert.equal(isValidNumberDraft("12.5", { min: 0, max: 100 }), false);
  assert.equal(isValidNumberDraft("12.5", { min: 0, max: 100, allowDecimal: true }), true);
});

test("applyNumberKey respects max", () => {
  assert.equal(applyNumberKey("9", "digit", "9", { min: 0, max: 10 }), "9");
  assert.equal(applyNumberKey("1", "digit", "0", { min: 0, max: 10 }), "10");
  assert.equal(applyNumberKey("12", "backspace", undefined, { min: 0, max: 100 }), "1");
});

test("validateFinalNumber returns Arabic messages", () => {
  assert.equal(validateFinalNumber("", { min: 0 }), "يرجى إدخال رقم");
  assert.equal(validateFinalNumber("-1", { min: 0 }), "القيمة يجب ألا تقل عن 0");
});
