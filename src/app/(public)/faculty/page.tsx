"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Search, Users } from "lucide-react";
import {
  FacultyTeacherCard,
  FacultyTeacherCardSkeleton,
} from "@/components/molecules/FacultyTeacherCard";
import { PremiumPageHero } from "@/components/molecules/PremiumPageHero";
import { PublicPage } from "@/components/molecules/PublicPage";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { TeacherProfile } from "@/types/teacher";

function teacherSubjectNames(teacher: TeacherProfile): string[] {
  if (teacher.subjects?.length) return teacher.subjects;
  if (!teacher.subject?.trim()) return [];
  return teacher.subject
    .split("،")
    .map((name) => name.trim())
    .filter(Boolean);
}

export default function FacultyPage() {
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);

  useEffect(() => {
    api
      .getTeachers()
      .then((data) => setTeachers(data as TeacherProfile[]))
      .catch(() => setTeachers([]))
      .finally(() => setLoading(false));
  }, []);

  const subjects = useMemo(() => {
    const unique = new Set<string>();
    for (const teacher of teachers) {
      for (const name of teacherSubjectNames(teacher)) {
        unique.add(name);
      }
    }
    return Array.from(unique).sort((a, b) => a.localeCompare(b, "ar"));
  }, [teachers]);

  const filtered = useMemo(() => {
    const q = search.trim();
    return teachers.filter((teacher) => {
      const names = teacherSubjectNames(teacher);
      const matchesSubject = !subjectFilter || names.includes(subjectFilter);
      const matchesSearch =
        !q ||
        teacher.name.includes(q) ||
        names.some((name) => name.includes(q)) ||
        teacher.bio?.includes(q);
      return matchesSubject && matchesSearch;
    });
  }, [teachers, search, subjectFilter]);

  return (
    <PublicPage title="" description="">
      <PremiumPageHero
        badge="فريقنا التربوي"
        title="الكادر التعليمي"
        description="نخبة من المعلمين والمعلمات يضعون الطالب في قلب العملية التعليمية، ويجمعون بين الخبرة الأكاديمية والاهتمام الشخصي بكل متعلّم."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-[1.5rem_0.7rem_1.5rem_0.9rem] border-[3px] border-black/10 bg-brand-blue/10 px-5 py-4 shadow-[-4px_5px_0_0_rgba(66,76,243,0.16)]">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-[-2px_2px_0_0_rgba(66,76,243,0.25)]">
            <Users className="h-6 w-6 text-brand-blue" />
          </span>
          <div>
            <p className="font-display text-2xl font-extrabold text-p-black">{teachers.length}</p>
            <p className="text-sm font-semibold text-p-black/60">عضو في الكادر التعليمي</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-[1.5rem_0.7rem_1.5rem_0.9rem] border-[3px] border-black/10 bg-brand-yellow/40 px-5 py-4 shadow-[-4px_5px_0_0_rgba(249,180,40,0.4)]">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-[-2px_2px_0_0_rgba(234,102,34,0.3)]">
            <GraduationCap className="h-6 w-6 text-brand-orange" />
          </span>
          <div>
            <p className="font-display text-2xl font-extrabold text-p-black">{subjects.length}</p>
            <p className="text-sm font-semibold text-p-black/60">تخصص أكاديمي مُغطّى</p>
          </div>
        </div>
      </div>

      {!loading && teachers.length > 0 && (
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو التخصص..."
              className="w-full rounded-2xl border-[3px] border-black/10 bg-white py-3 pe-4 ps-11 text-sm font-semibold text-p-black shadow-[-3px_3px_0_0_rgba(66,76,243,0.1)] outline-none transition-colors focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15"
            />
          </div>

          {subjects.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSubjectFilter(null)}
                className={cn(
                  "font-display rounded-full px-4 py-2 text-sm font-extrabold transition-transform hover:-translate-y-0.5",
                  subjectFilter === null
                    ? "bg-brand-yellow text-p-black shadow-[-2px_2px_0_0_rgba(234,102,34,0.45)]"
                    : "border-2 border-black/10 bg-white text-p-black/70 hover:border-brand-yellow"
                )}
              >
                الكل
              </button>
              {subjects.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => setSubjectFilter(subject)}
                  className={cn(
                    "font-display rounded-full px-4 py-2 text-sm font-extrabold transition-transform hover:-translate-y-0.5",
                    subjectFilter === subject
                      ? "bg-brand-yellow text-p-black shadow-[-2px_2px_0_0_rgba(234,102,34,0.45)]"
                      : "border-2 border-black/10 bg-white text-p-black/70 hover:border-brand-yellow"
                  )}
                >
                  {subject}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="card-grid card-grid-4">
          {Array.from({ length: 8 }, (_, i) => (
            <FacultyTeacherCardSkeleton key={i} />
          ))}
        </div>
      ) : teachers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-16 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-neutral-300" />
          <p className="mt-4 text-lg font-semibold text-neutral-700">
            لا يوجد كادر تعليمي معروض حالياً
          </p>
          <p className="mt-2 text-sm text-neutral-700">
            سيتم نشر ملفات المعلمين هنا فور اعتمادها من إدارة المدرسة.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-12 text-center">
          <p className="font-semibold text-neutral-700">لا توجد نتائج مطابقة</p>
          <p className="mt-2 text-sm text-neutral-700">جرّب تغيير كلمة البحث أو التخصص.</p>
        </div>
      ) : (
        <div className="card-grid card-grid-4">
          {filtered.map((teacher, index) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: (index % 4) * 0.06 }}
              className="h-full"
            >
              <FacultyTeacherCard teacher={teacher} />
            </motion.div>
          ))}
        </div>
      )}
    </PublicPage>
  );
}
