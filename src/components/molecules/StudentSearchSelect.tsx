"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

export type StudentSearchOption = {
  id: string;
  name: string;
  grade: string;
  studentNumber: string;
};

type StudentSearchSelectProps = {
  students: StudentSearchOption[];
  value: string;
  onChange: (studentId: string) => void;
  label?: string;
  placeholder?: string;
};

export function StudentSearchSelect({
  students,
  value,
  onChange,
  label = "الطالب",
  placeholder = "ابحث بالاسم أو رقم الطالب...",
}: StudentSearchSelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => students.find((s) => s.id === value) ?? null,
    [students, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students.slice(0, 20);
    return students
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.studentNumber.toLowerCase().includes(q) ||
          s.grade.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [students, query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectStudent(student: StudentSearchOption) {
    onChange(student.id);
    setQuery("");
    setOpen(false);
  }

  function clearSelection() {
    onChange("");
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <label className="mb-1.5 block text-sm font-medium text-p-black/80">{label}</label>

      {selected && !open ? (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-p-black">{selected.name}</p>
            <p className="text-xs text-p-black/50">
              {selected.studentNumber} — {selected.grade}
            </p>
          </div>
          <button
            type="button"
            onClick={clearSelection}
            className="shrink-0 text-xs font-semibold text-p-green hover:underline"
          >
            تغيير
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-p-black/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              if (value) onChange("");
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pe-4 ps-10 text-sm text-p-black placeholder:text-neutral-400 focus:border-p-green focus:outline-none focus:ring-2 focus:ring-p-green/20"
          />
        </div>
      )}

      {open && !selected && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-neutral-100 bg-white py-1 shadow-lg">
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-p-black/50">لا توجد نتائج</li>
          ) : (
            filtered.map((student) => (
              <li key={student.id}>
                <button
                  type="button"
                  onClick={() => selectStudent(student)}
                  className={cn(
                    "w-full px-4 py-2.5 text-start text-sm transition-colors hover:bg-p-green/5",
                    value === student.id && "bg-p-green/10"
                  )}
                >
                  <span className="font-medium text-p-black">{student.name}</span>
                  <span className="mt-0.5 block text-xs text-p-black/50">
                    {student.studentNumber} — {student.grade}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
