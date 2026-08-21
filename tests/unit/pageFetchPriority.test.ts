import assert from "node:assert/strict";
import { test } from "node:test";

import {
  adminPathNeedsCatalog,
  adminPathNeedsStaff,
  parentPathNeedsAssignments,
  teacherPathNeedsSchool,
} from "../../src/lib/pageFetchPriority.ts";

test("admin list pages skip heavy catalog/staff", () => {
  assert.equal(adminPathNeedsCatalog("/admin/schedules"), false);
  assert.equal(adminPathNeedsCatalog("/admin/analytics"), false);
  assert.equal(adminPathNeedsCatalog("/admin/schedules/create"), true);
  assert.equal(adminPathNeedsStaff("/admin/schedules"), false);
  assert.equal(adminPathNeedsStaff("/admin/schedules/create"), true);
  assert.equal(adminPathNeedsStaff("/admin/teachers"), true);
});

test("teacher and parent skip unused bootstrap", () => {
  assert.equal(teacherPathNeedsSchool("/teacher/schedules"), false);
  assert.equal(teacherPathNeedsSchool("/teacher"), true);
  assert.equal(parentPathNeedsAssignments("/parent/homework/subject/math"), false);
  assert.equal(parentPathNeedsAssignments("/parent/quizzes"), true);
});
