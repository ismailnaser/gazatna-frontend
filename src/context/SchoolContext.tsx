"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  initialAssignments,
  initialTeachers,
  schoolClasses,
} from "@/data/teachers";
import type { SchoolClass, TeacherProfile } from "@/types/teacher";

type SchoolState = {
  teachers: TeacherProfile[];
  assignments: Record<string, string[]>;
};

type SchoolContextValue = SchoolState & {
  classes: SchoolClass[];
  getTeacherClasses: (teacherId: string) => SchoolClass[];
  getTeacherClassesByUserId: (userId: string) => SchoolClass[];
  setTeacherClasses: (teacherId: string, classIds: string[]) => void;
  addTeacher: (teacher: Omit<TeacherProfile, "id">) => void;
  updateTeacher: (id: string, data: Partial<TeacherProfile>) => void;
  removeTeacher: (id: string) => void;
};

const STORAGE_KEY = "ghazatna_school";

const SchoolContext = createContext<SchoolContextValue | null>(null);

function mergeTeachers(stored: TeacherProfile[]): TeacherProfile[] {
  return stored.map((t) => {
    const seed = initialTeachers.find((s) => s.id === t.id);
    return {
      ...t,
      experience: t.experience ?? seed?.experience ?? "—",
      bio: t.bio ?? seed?.bio ?? "",
    };
  });
}

function loadState(): SchoolState {
  if (typeof window === "undefined") {
    return { teachers: initialTeachers, assignments: initialAssignments };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { teachers: initialTeachers, assignments: initialAssignments };
    const parsed = JSON.parse(raw) as SchoolState;
    return {
      teachers: mergeTeachers(parsed.teachers),
      assignments: parsed.assignments,
    };
  } catch {
    return { teachers: initialTeachers, assignments: initialAssignments };
  }
}

export function SchoolProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SchoolState>({
    teachers: initialTeachers,
    assignments: initialAssignments,
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, hydrated]);

  const getTeacherClasses = useCallback(
    (teacherId: string) => {
      const ids = state.assignments[teacherId] ?? [];
      return schoolClasses.filter((c) => ids.includes(c.id));
    },
    [state.assignments]
  );

  const getTeacherClassesByUserId = useCallback(
    (userId: string) => {
      const teacher = state.teachers.find((t) => t.userId === userId);
      if (!teacher) return [];
      return getTeacherClasses(teacher.id);
    },
    [state.teachers, getTeacherClasses]
  );

  const setTeacherClasses = useCallback((teacherId: string, classIds: string[]) => {
    setState((prev) => ({
      ...prev,
      assignments: { ...prev.assignments, [teacherId]: classIds },
    }));
  }, []);

  const addTeacher = useCallback((teacher: Omit<TeacherProfile, "id">) => {
    const id = `t${Date.now()}`;
    setState((prev) => ({
      teachers: [...prev.teachers, { ...teacher, id }],
      assignments: { ...prev.assignments, [id]: [] },
    }));
  }, []);

  const updateTeacher = useCallback((id: string, data: Partial<TeacherProfile>) => {
    setState((prev) => ({
      ...prev,
      teachers: prev.teachers.map((t) => (t.id === id ? { ...t, ...data } : t)),
    }));
  }, []);

  const removeTeacher = useCallback((id: string) => {
    setState((prev) => {
      const { [id]: _, ...rest } = prev.assignments;
      return {
        teachers: prev.teachers.filter((t) => t.id !== id),
        assignments: rest,
      };
    });
  }, []);

  return (
    <SchoolContext.Provider
      value={{
        ...state,
        classes: schoolClasses,
        getTeacherClasses,
        getTeacherClassesByUserId,
        setTeacherClasses,
        addTeacher,
        updateTeacher,
        removeTeacher,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  const ctx = useContext(SchoolContext);
  if (!ctx) throw new Error("useSchool must be used within SchoolProvider");
  return ctx;
}
