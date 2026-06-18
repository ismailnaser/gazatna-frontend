"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { isAdminRole } from "@/lib/adminRoles";
import type { SchoolClass, Subject, TeacherProfile } from "@/types/teacher";

type SchoolState = {
  teachers: TeacherProfile[];
  assignments: Record<string, string[]>;
};

type SchoolContextValue = SchoolState & {
  classes: SchoolClass[];
  subjects: Subject[];
  currentTeacher: TeacherProfile | null;
  loading: boolean;
  getTeacherClasses: (teacherId: string) => SchoolClass[];
  getTeacherClassesByUserId: (userId: string) => SchoolClass[];
  setTeacherClasses: (teacherId: string, classIds: string[]) => Promise<void>;
  addTeacher: (teacher: Omit<TeacherProfile, "id">, image?: File) => Promise<TeacherProfile>;
  updateTeacher: (id: string, data: Partial<TeacherProfile>, image?: File) => Promise<TeacherProfile>;
  removeTeacher: (id: string) => Promise<void>;
  addClass: (gradeLevel: string, section: string) => Promise<SchoolClass>;
  removeClass: (id: string) => Promise<void>;
  addSubject: (name: string) => Promise<Subject>;
  updateSubject: (id: string, name: string) => Promise<Subject>;
  removeSubject: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const SchoolContext = createContext<SchoolContextValue | null>(null);

function buildAssignments(teachers: TeacherProfile[]): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const t of teachers) {
    map[t.id] = t.classIds ?? [];
  }
  return map;
}

export function SchoolProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<SchoolState>({
    teachers: [],
    assignments: {},
  });
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentTeacher, setCurrentTeacher] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      try {
        const teachersData = await api.getTeachers();
        const teachers = teachersData as TeacherProfile[];
        setCurrentTeacher(null);
        setState({ teachers, assignments: buildAssignments(teachers) });
      } catch {
        setCurrentTeacher(null);
        setState({ teachers: [], assignments: {} });
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      if (isAdminRole(user.role)) {
        const [teachersData, classesData, subjectsData] = await Promise.all([
          api.getAdminTeachers(),
          api.getAdminClasses(),
          api.getAdminSubjects(),
        ]);
        const teachers = teachersData as TeacherProfile[];
        setCurrentTeacher(null);
        setState({ teachers, assignments: buildAssignments(teachers) });
        setClasses(classesData as SchoolClass[]);
        setSubjects(subjectsData as Subject[]);
      } else if (user.role === "teacher") {
        const [classesResult, profileResult] = await Promise.allSettled([
          api.getTeacherClasses(),
          api.getTeacherProfile(),
        ]);
        const classesData =
          classesResult.status === "fulfilled" ? (classesResult.value as SchoolClass[]) : [];
        const teacher =
          profileResult.status === "fulfilled" ? (profileResult.value as TeacherProfile) : null;
        setClasses(classesData);
        setCurrentTeacher(teacher);
        setState(
          teacher
            ? { teachers: [teacher], assignments: buildAssignments([teacher]) }
            : { teachers: [], assignments: {} }
        );
      } else if (user.role === "parent") {
        setCurrentTeacher(null);
        setState({ teachers: [], assignments: {} });
        setClasses([]);
        setSubjects([]);
      } else {
        const teachersData = await api.getTeachers();
        const teachers = teachersData as TeacherProfile[];
        setCurrentTeacher(null);
        setState({ teachers, assignments: buildAssignments(teachers) });
      }
    } catch {
      setCurrentTeacher(null);
      setState({ teachers: [], assignments: {} });
      setClasses([]);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getTeacherClasses = useCallback(
    (teacherId: string) => {
      const ids = state.assignments[teacherId] ?? [];
      return classes.filter((c) => ids.includes(c.id));
    },
    [state.assignments, classes]
  );

  const getTeacherClassesByUserId = useCallback(
    (userId: string) => {
      if (user?.role === "teacher") {
        return classes;
      }
      const teacher = state.teachers.find((t) => String(t.userId) === String(userId));
      if (!teacher) return [];
      return getTeacherClasses(teacher.id);
    },
    [state.teachers, getTeacherClasses, classes, user]
  );

  const setTeacherClasses = useCallback(async (teacherId: string, classIds: string[]) => {
    const teacher = state.teachers.find((t) => t.id === teacherId);
    if (!teacher) return;
    await api.updateAdminTeacher(teacherId, { classIds: classIds.map(Number) });
    setState((prev) => ({
      ...prev,
      assignments: { ...prev.assignments, [teacherId]: classIds },
      teachers: prev.teachers.map((t) =>
        t.id === teacherId ? { ...t, classIds } : t
      ),
    }));
  }, [state.teachers]);

  const addTeacher = useCallback(async (teacher: Omit<TeacherProfile, "id">, image?: File) => {
    const classIds = (teacher.classIds ?? []).map(Number);
    const base = {
      name: teacher.name,
      experience: teacher.experience,
      bio: teacher.bio,
      imageGradient: teacher.imageGradient,
      classIds,
    };

    let created: TeacherProfile;
    if (image) {
      const formData = new FormData();
      formData.append("name", teacher.name);
      formData.append("experience", teacher.experience);
      formData.append("bio", teacher.bio);
      formData.append("imageGradient", teacher.imageGradient);
      teacher.subjectIds?.forEach((id) => formData.append("subjectIds", id));
      teacher.classIds?.forEach((id) => formData.append("classIds", id));
      formData.append("image", image);
      created = (await api.createAdminTeacher(formData)) as TeacherProfile;
    } else {
      const payload: Record<string, unknown> = { ...base };
      if (teacher.subjectIds?.length) {
        payload.subjectIds = teacher.subjectIds.map(Number);
      }
      created = (await api.createAdminTeacher(payload)) as TeacherProfile;
    }
    setState((prev) => ({
      teachers: [...prev.teachers, created],
      assignments: { ...prev.assignments, [created.id]: [] },
    }));
    return created;
  }, []);

  const updateTeacher = useCallback(async (id: string, data: Partial<TeacherProfile>, image?: File) => {
    let updated: TeacherProfile;
    if (image) {
      const formData = new FormData();
      formData.append("image", image);
      updated = (await api.updateAdminTeacher(id, formData)) as TeacherProfile;
    } else {
      const payload: Record<string, unknown> = { ...data };
      if (data.subjectIds) {
        payload.subjectIds = data.subjectIds.map(Number);
        delete payload.subject;
        delete payload.subjects;
      }
      updated = (await api.updateAdminTeacher(id, payload)) as TeacherProfile;
    }
    setState((prev) => ({
      ...prev,
      teachers: prev.teachers.map((t) => (t.id === id ? { ...t, ...updated } : t)),
    }));
    return updated;
  }, []);

  const removeTeacher = useCallback(async (id: string) => {
    await api.deleteAdminTeacher(id);
    setState((prev) => {
      const { [id]: _, ...rest } = prev.assignments;
      return {
        teachers: prev.teachers.filter((t) => t.id !== id),
        assignments: rest,
      };
    });
  }, []);

  const addClass = useCallback(async (gradeLevel: string, section: string) => {
    const created = (await api.createAdminClass({ gradeLevel, section })) as SchoolClass;
    setClasses((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name, "ar")));
    return created;
  }, []);

  const removeClass = useCallback(async (id: string) => {
    await api.deleteAdminClass(id);
    setClasses((prev) => prev.filter((c) => c.id !== id));
    setState((prev) => {
      const assignments = { ...prev.assignments };
      for (const teacherId of Object.keys(assignments)) {
        assignments[teacherId] = assignments[teacherId].filter((cid) => cid !== id);
      }
      return { ...prev, assignments };
    });
  }, []);

  const addSubject = useCallback(async (name: string) => {
    const created = (await api.createAdminSubject({ name })) as Subject;
    setSubjects((prev) =>
      [...prev, created].sort((a, b) => a.name.localeCompare(b.name, "ar"))
    );
    return created;
  }, []);

  const updateSubject = useCallback(async (id: string, name: string) => {
    const previous = subjects.find((s) => s.id === id);
    const updated = (await api.updateAdminSubject(id, { name })) as Subject;
    setSubjects((prev) =>
      prev
        .map((s) => (s.id === id ? updated : s))
        .sort((a, b) => a.name.localeCompare(b.name, "ar"))
    );
    if (previous && previous.name !== name) {
      setState((prev) => ({
        ...prev,
        teachers: prev.teachers.map((teacher) => {
          const subjectIds = teacher.subjectIds ?? [];
          if (!subjectIds.includes(id)) return teacher;
          const nextSubjects =
            teacher.subjects?.map((subjectName) =>
              subjectName === previous.name ? name : subjectName
            ) ?? [];
          return {
            ...teacher,
            subjects: nextSubjects,
            subject: nextSubjects.join("، "),
          };
        }),
      }));
    }
    return updated;
  }, [subjects]);

  const removeSubject = useCallback(async (id: string) => {
    await api.deleteAdminSubject(id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return (
    <SchoolContext.Provider
      value={{
        ...state,
        classes,
        subjects,
        currentTeacher,
        loading,
        getTeacherClasses,
        getTeacherClassesByUserId,
        setTeacherClasses,
        addTeacher,
        updateTeacher,
        removeTeacher,
        addClass,
        removeClass,
        addSubject,
        updateSubject,
        removeSubject,
        refresh,
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
