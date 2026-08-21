import assert from "node:assert/strict";
import { test } from "node:test";

import {
  isValidNationalId,
  normalizeNationalId,
  validateNationalId,
  validateNationalIdUniqueness,
} from "../../src/lib/nationalId.ts";

test("normalizeNationalId strips non-digits and caps at 9", () => {
  assert.equal(normalizeNationalId("12-345-6789 extra"), "123456789");
  assert.equal(normalizeNationalId("1234567890123"), "123456789");
});

test("isValidNationalId accepts exactly 9 digits", () => {
  assert.equal(isValidNationalId("123456789"), true);
  assert.equal(isValidNationalId("12345"), false);
  assert.equal(isValidNationalId("abcdefghi"), false);
});

test("validateNationalId required empty value", () => {
  assert.equal(validateNationalId("", { required: true }), "رقم الهوية مطلوب");
  assert.equal(validateNationalId(""), null);
});

test("validateNationalIdUniqueness ignores the current student", () => {
  const existing = [
    { id: "1", nationalId: "123456789" },
    { id: "2", nationalId: "987654321" },
  ];
  assert.equal(validateNationalIdUniqueness("123456789", existing, { excludeStudentId: "1" }), null);
  assert.equal(
    validateNationalIdUniqueness("123456789", existing),
    "رقم الهوية مستخدم مسبقاً لطالب آخر"
  );
});
