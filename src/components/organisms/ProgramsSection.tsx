"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap } from "lucide-react";
import { api } from "@/lib/api";

type ProgramRow = { grade: string; description: string };

function ProgramCard({
  program,
  index,
  gradient,
}: {
  program: ProgramRow;
  index: number;
  gradient: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const description = (program.description || "").trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="flex flex-col"
    >
      <article className="group flex flex-col overflow-hidden rounded-[1.65rem_0.55rem_1.65rem_0.85rem] border-[3px] border-black/10 bg-[#fff8ec] shadow-[-7px_7px_0_0_rgba(26,26,26,0.08)] transition duration-300 hover:-translate-y-1 hover:rotate-[0.4deg] hover:shadow-[-11px_11px_0_0_rgba(66,76,243,0.18)]">
        <div className={["flex items-center gap-3 bg-gradient-to-l px-5 py-4", gradient].join(" ")}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <BookOpen className="h-5 w-5 text-white" />
          </span>
          <div>
            <h3 className="font-display font-extrabold text-white">الصف {program.grade}</h3>
          </div>
        </div>
        {expanded && description ? (
          <div className="p-5">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-p-black/70">{description}</p>
          </div>
        ) : null}
      </article>
      {description ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 self-start px-1 text-sm font-semibold text-brand-blue hover:underline"
        >
          {expanded ? "عرض أقل" : "عرض المزيد"}
        </button>
      ) : null}
    </motion.div>
  );
}

export function ProgramsSection() {
  const [items, setItems] = useState<ProgramRow[]>([]);
  const [loading, setLoading] = useState(true);

  const headerGradients = useMemo(
    () => [
      "from-brand-blue/90 to-brand-blue", // Royal
      "from-amber-400 to-yellow-500", // Golden
      "from-orange-500 to-rose-500", // Vibrant
      "from-sky-400 to-cyan-500", // Sky
      "from-emerald-500 to-green-600", // Green
      "from-fuchsia-500 to-[var(--brand-magenta)]", // Magenta
    ],
    []
  );

  useEffect(() => {
    api
      .getSiteSettings()
      .then((data) => {
        const s = data as { programs?: ProgramRow[] };
        setItems(Array.isArray(s.programs) ? s.programs : []);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => items, [items]);

  if (!loading && visible.length === 0) {
    return null;
  }

  return (
    <section className="relative py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 flex flex-wrap items-end justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-blue/10">
              <GraduationCap className="h-5 w-5 text-brand-blue" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-extrabold text-brand-blue">البرامج التعليمية</h2>
              <p className="mt-1 text-sm text-p-black/50">
                مسارات تعليمية حسب الصفوف الدراسية في مدرسة غَزتنا
              </p>
            </div>
          </div>
          <Link
            href="/programs"
            prefetch={false}
            className="text-sm font-semibold text-[var(--brand-magenta)] hover:underline"
          >
            عرض الكل
          </Link>
        </motion.div>

        {loading ? (
          <div className="card-grid card-grid-lg">
            <div className="h-40 animate-pulse rounded-[1.65rem_0.55rem_1.65rem_0.85rem] bg-white" />
            <div className="h-40 animate-pulse rounded-[1.65rem_0.55rem_1.65rem_0.85rem] bg-white" />
            <div className="h-40 animate-pulse rounded-[1.65rem_0.55rem_1.65rem_0.85rem] bg-white" />
          </div>
        ) : visible.length === 0 ? null : (
          <div className="card-grid card-grid-lg">
            {visible.map((p, i) => (
              <ProgramCard
                key={p.grade}
                program={p}
                index={i}
                gradient={headerGradients[i % headerGradients.length]}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
