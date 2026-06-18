"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SchoolClass } from "@/types/teacher";

export function ClassSelect({
  classes,
  multiple = false,
  defaultValue,
  defaultSelected,
  required = true,
}: {
  classes: SchoolClass[];
  multiple?: boolean;
  /** فصل واحد — للتعديل */
  defaultValue?: string;
  /** فصول متعددة — للإنشاء */
  defaultSelected?: string[];
  required?: boolean;
}) {
  const [selected, setSelected] = useState<string[]>(
    defaultSelected ?? (defaultValue ? [defaultValue] : classes.map((c) => c.id))
  );

  if (!multiple) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-p-black/80">الفصل</label>
        <select
          name="classId"
          required={required}
          defaultValue={defaultValue ?? classes[0]?.id}
          className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-p-black focus:border-p-green focus:outline-none focus:ring-2 focus:ring-p-green/20"
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function selectAll() {
    setSelected(classes.map((c) => c.id));
  }

  function clearAll() {
    setSelected([]);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-bold text-p-black/80">
          الفصول {required && <span className="text-brand-orange">*</span>}
        </label>
        <div className="flex rounded-lg border border-neutral-200 bg-white p-0.5 text-xs">
          <button
            type="button"
            onClick={selectAll}
            className="rounded-md px-2.5 py-1 font-semibold text-brand-blue hover:bg-brand-blue/5"
          >
            الكل
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="rounded-md px-2.5 py-1 font-semibold text-p-black/50 hover:bg-neutral-50"
          >
            إلغاء
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {classes.map((c) => {
          const checked = selected.includes(c.id);
          return (
            <label
              key={c.id}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                checked
                  ? "border-brand-blue bg-brand-blue/5 font-medium text-brand-blue"
                  : "border-neutral-200 hover:border-brand-blue/30"
              )}
            >
              <input
                type="checkbox"
                name="classIds"
                value={c.id}
                checked={checked}
                onChange={() => toggle(c.id)}
                className="rounded text-brand-blue"
              />
              {c.name}
            </label>
          );
        })}
      </div>

      {selected.length === 0 && required && (
        <p className="text-xs text-brand-orange">اختر فصلاً واحداً على الأقل</p>
      )}
      {selected.length > 0 && (
        <p className="rounded-lg bg-brand-blue/5 px-3 py-2 text-xs text-brand-blue">
          {selected.length} {selected.length === 1 ? "فصل محدّد" : "فصول محدّدة"}
        </p>
      )}
    </div>
  );
}

export function getSelectedClassIds(form: FormData): string[] {
  return form.getAll("classIds").map(String).filter(Boolean);
}
