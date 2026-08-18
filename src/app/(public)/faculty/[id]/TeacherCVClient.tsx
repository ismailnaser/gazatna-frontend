"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TeacherCV } from "@/components/organisms/TeacherCV";
import { useSchool } from "@/context/SchoolContext";
import { api } from "@/lib/api";
import type { TeacherProfile } from "@/types/teacher";

export function TeacherCVClient({ id }: { id: string }) {
  const { teachers, getTeacherClasses, loading } = useSchool();
  const [fetched, setFetched] = useState<TeacherProfile | null>(null);
  const [fetching, setFetching] = useState(false);

  const fromContext = teachers.find((t) => t.id === id);
  const teacher = fromContext ?? fetched;

  useEffect(() => {
    if (fromContext || loading) return;
    let cancelled = false;
    setFetching(true);
    api
      .getTeachers()
      .then((rows) => {
        if (cancelled) return;
        const match = (rows as TeacherProfile[]).find((row) => String(row.id) === String(id)) ?? null;
        setFetched(match);
      })
      .catch(() => {
        if (!cancelled) setFetched(null);
      })
      .finally(() => {
        if (!cancelled) setFetching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fromContext, loading, id]);

  if (loading || fetching) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="h-40 animate-pulse rounded-2xl bg-neutral-100" />
        <div className="mt-4 h-24 animate-pulse rounded-2xl bg-neutral-100" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-[#1a1a1a]/50">المعلم غير موجود.</p>
        <Link href="/faculty" className="mt-4 inline-block text-[var(--brand-teal)] hover:underline">
          العودة للكادر التعليمي
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white px-4 pb-12 pt-[var(--nav-height)] sm:px-6 sm:pb-16">
      <TeacherCV teacher={teacher} classes={getTeacherClasses(teacher.id)} />
    </div>
  );
}
