"use client";

import Link from "next/link";
import { formatClassLabel } from "@/lib/adminStudents";

export function StudentHero({
  name,
  grade,
  section,
  studentNumber,
}: {
  name: string;
  grade: string;
  section: string;
  studentNumber?: string;
}) {
  const first = name.trim().split(/\s+/)[0] || name;

  return (
    <section className="relative mb-8 overflow-hidden rounded-[2rem] border-[3px] border-black/10 bg-linear-to-l from-[#fff4c8] via-white to-[#dcebff] p-5 shadow-[-6px_8px_0_0_rgba(249,180,40,0.28)] sm:p-7">
      <p className="font-display text-sm font-extrabold text-brand-orange">يا هلا يا بطل</p>
      <h2 className="font-display mt-1 text-3xl font-extrabold text-brand-blue sm:text-4xl">
        {first}!
      </h2>
      <p className="mt-2 max-w-md text-sm font-bold text-p-black/70">
        {formatClassLabel(grade, section)}
        {studentNumber ? ` · رقم ${studentNumber}` : ""}
      </p>
      <div className="mt-5">
        <Link
          href="/parent/homework"
          prefetch={false}
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-brand-blue"
        >
          مهام اليوم
        </Link>
      </div>
    </section>
  );
}
