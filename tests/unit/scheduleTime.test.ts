import assert from "node:assert/strict";
import { test } from "node:test";

import {
  classLessonRangesOverlap,
  formatScheduleTime12,
  getClassLessonEndTime,
  parseTimeToMinutes,
} from "../../src/lib/scheduleTime.ts";

test("parseTimeToMinutes handles 24h times", () => {
  assert.equal(parseTimeToMinutes("08:00"), 480);
  assert.equal(parseTimeToMinutes("17:30"), 1050);
  assert.equal(parseTimeToMinutes("bad"), null);
});

test("getClassLessonEndTime adds duration", () => {
  assert.equal(getClassLessonEndTime("08:00", 45), "08:45");
  assert.equal(getClassLessonEndTime("23:30", 60), "00:30");
});

test("classLessonRangesOverlap detects collisions", () => {
  assert.equal(classLessonRangesOverlap("08:00", 45, "08:30", 45), true);
  assert.equal(classLessonRangesOverlap("08:00", 45, "08:45", 45), false);
  assert.equal(classLessonRangesOverlap("10:00", 60, "09:00", 45), false);
});

test("formatScheduleTime12 uses Arabic periods", () => {
  assert.equal(formatScheduleTime12("08:00"), "8:00 صباحاً");
  assert.equal(formatScheduleTime12("17:30"), "5:30 مساءً");
  assert.equal(formatScheduleTime12(null), "—");
  assert.equal(formatScheduleTime12(45), "45");
});
