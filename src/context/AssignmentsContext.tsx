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
import type {
  Homework,
  HomeworkSubmission,
  Quiz,
  QuizQuestion,
  QuizSubmission,
} from "@/types";

type AssignmentsState = {
  homework: Homework[];
  quizzes: Quiz[];
  homeworkSubmissions: HomeworkSubmission[];
  quizSubmissions: QuizSubmission[];
};

type AssignmentsContextValue = AssignmentsState & {
  loading: boolean;
  getHomeworkByClass: (classId: string) => Homework[];
  getQuizzesByClass: (classId: string) => Quiz[];
  getHomeworkByTeacher: (teacherId: string, classIds: string[]) => Homework[];
  getQuizzesByTeacher: (teacherId: string, classIds: string[]) => Quiz[];
  addHomework: (data: Omit<Homework, "id" | "createdAt">) => Promise<Homework>;
  updateHomework: (id: string, data: Partial<Omit<Homework, "id" | "createdAt">>) => Promise<void>;
  deleteHomework: (id: string) => Promise<void>;
  addQuiz: (data: Omit<Quiz, "id" | "createdAt">) => Promise<Quiz>;
  updateQuiz: (id: string, data: Partial<Omit<Quiz, "id" | "createdAt">>) => Promise<void>;
  deleteQuiz: (id: string) => Promise<void>;
  submitHomework: (data: Omit<HomeworkSubmission, "id" | "submittedAt">) => Promise<HomeworkSubmission>;
  getHomeworkSubmission: (homeworkId: string, studentId: string) => HomeworkSubmission | undefined;
  getHomeworkSubmissions: (homeworkId: string) => HomeworkSubmission[];
  submitQuiz: (data: Omit<QuizSubmission, "id" | "submittedAt">) => Promise<QuizSubmission>;
  getQuizSubmission: (quizId: string, studentId: string) => QuizSubmission | undefined;
  getQuizSubmissions: (quizId: string) => QuizSubmission[];
  refresh: () => Promise<void>;
};

function normalizeQuiz(q: Quiz): Quiz {
  return {
    ...q,
    startAt: q.startAt ?? `${q.dueDate}T08:00:00`,
    durationMinutes: q.durationMinutes ?? 30,
  };
}

const AssignmentsContext = createContext<AssignmentsContextValue | null>(null);

export function AssignmentsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<AssignmentsState>({
    homework: [],
    quizzes: [],
    homeworkSubmissions: [],
    quizSubmissions: [],
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (user.role === "teacher") {
        const [homework, quizzes] = await Promise.all([
          api.getTeacherHomework(),
          api.getTeacherQuizzes(),
        ]);
        setState((prev) => ({
          ...prev,
          homework: homework as Homework[],
          quizzes: (quizzes as Quiz[]).map(normalizeQuiz),
        }));
      } else if (user.role === "parent") {
        const [homework, quizzes, submissions] = await Promise.all([
          api.getParentHomework(),
          api.getParentQuizzes(),
          api.getParentSubmissions(),
        ]);
        const subs = submissions as { homework: HomeworkSubmission[]; quizzes: QuizSubmission[] };
        setState({
          homework: homework as Homework[],
          quizzes: (quizzes as Quiz[]).map(normalizeQuiz),
          homeworkSubmissions: subs.homework,
          quizSubmissions: subs.quizzes,
        });
      }
    } catch {
      setState({
        homework: [],
        quizzes: [],
        homeworkSubmissions: [],
        quizSubmissions: [],
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getHomeworkByClass = useCallback(
    (classId: string) =>
      state.homework
        .filter((h) => h.classId === classId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [state.homework]
  );

  const getQuizzesByClass = useCallback(
    (classId: string) =>
      state.quizzes
        .filter((q) => q.classId === classId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [state.quizzes]
  );

  const getHomeworkByTeacher = useCallback(
    (teacherId: string, classIds: string[]) =>
      state.homework
        .filter((h) => h.teacherId === teacherId && classIds.includes(h.classId))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [state.homework]
  );

  const getQuizzesByTeacher = useCallback(
    (teacherId: string, classIds: string[]) =>
      state.quizzes
        .filter((q) => q.teacherId === teacherId && classIds.includes(q.classId))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [state.quizzes]
  );

  const addHomework = useCallback(async (data: Omit<Homework, "id" | "createdAt">) => {
    const item = (await api.createTeacherHomework(data)) as Homework;
    setState((prev) => ({ ...prev, homework: [item, ...prev.homework] }));
    return item;
  }, []);

  const updateHomework = useCallback(
    async (id: string, data: Partial<Omit<Homework, "id" | "createdAt">>) => {
      const item = (await api.updateTeacherHomework(id, data)) as Homework;
      setState((prev) => ({
        ...prev,
        homework: prev.homework.map((h) => (h.id === id ? item : h)),
      }));
    },
    []
  );

  const deleteHomework = useCallback(async (id: string) => {
    await api.deleteTeacherHomework(id);
    setState((prev) => ({
      ...prev,
      homework: prev.homework.filter((h) => h.id !== id),
      homeworkSubmissions: prev.homeworkSubmissions.filter((s) => s.homeworkId !== id),
    }));
  }, []);

  const addQuiz = useCallback(async (data: Omit<Quiz, "id" | "createdAt">) => {
    const item = normalizeQuiz((await api.createTeacherQuiz(data)) as Quiz);
    setState((prev) => ({ ...prev, quizzes: [item, ...prev.quizzes] }));
    return item;
  }, []);

  const updateQuiz = useCallback(
    async (id: string, data: Partial<Omit<Quiz, "id" | "createdAt">>) => {
      const item = normalizeQuiz((await api.updateTeacherQuiz(id, data)) as Quiz);
      setState((prev) => ({
        ...prev,
        quizzes: prev.quizzes.map((q) => (q.id === id ? item : q)),
      }));
    },
    []
  );

  const deleteQuiz = useCallback(async (id: string) => {
    await api.deleteTeacherQuiz(id);
    setState((prev) => ({
      ...prev,
      quizzes: prev.quizzes.filter((q) => q.id !== id),
      quizSubmissions: prev.quizSubmissions.filter((s) => s.quizId !== id),
    }));
  }, []);

  const submitHomework = useCallback(
    async (data: Omit<HomeworkSubmission, "id" | "submittedAt">) => {
      const item = (await api.submitParentHomework(data.homeworkId, data.content)) as HomeworkSubmission;
      setState((prev) => ({
        ...prev,
        homeworkSubmissions: [
          ...prev.homeworkSubmissions.filter(
            (s) => !(s.homeworkId === data.homeworkId && s.studentId === data.studentId)
          ),
          item,
        ],
      }));
      return item;
    },
    []
  );

  const getHomeworkSubmission = useCallback(
    (homeworkId: string, studentId: string) =>
      state.homeworkSubmissions.find(
        (s) => s.homeworkId === homeworkId && s.studentId === studentId
      ),
    [state.homeworkSubmissions]
  );

  const getHomeworkSubmissions = useCallback(
    (homeworkId: string) =>
      state.homeworkSubmissions.filter((s) => s.homeworkId === homeworkId),
    [state.homeworkSubmissions]
  );

  const submitQuiz = useCallback(
    async (data: Omit<QuizSubmission, "id" | "submittedAt">) => {
      const item = (await api.submitParentQuiz({
        quizId: data.quizId,
        answers: data.answers,
        timeSpentSeconds: data.timeSpentSeconds,
      })) as QuizSubmission;
      setState((prev) => ({
        ...prev,
        quizSubmissions: [
          ...prev.quizSubmissions.filter(
            (s) => !(s.quizId === data.quizId && s.studentId === data.studentId)
          ),
          item,
        ],
      }));
      return item;
    },
    []
  );

  const getQuizSubmission = useCallback(
    (quizId: string, studentId: string) =>
      state.quizSubmissions.find((s) => s.quizId === quizId && s.studentId === studentId),
    [state.quizSubmissions]
  );

  const getQuizSubmissions = useCallback(
    (quizId: string) => state.quizSubmissions.filter((s) => s.quizId === quizId),
    [state.quizSubmissions]
  );

  return (
    <AssignmentsContext.Provider
      value={{
        ...state,
        loading,
        getHomeworkByClass,
        getQuizzesByClass,
        getHomeworkByTeacher,
        getQuizzesByTeacher,
        addHomework,
        updateHomework,
        deleteHomework,
        addQuiz,
        updateQuiz,
        deleteQuiz,
        submitHomework,
        getHomeworkSubmission,
        getHomeworkSubmissions,
        submitQuiz,
        getQuizSubmission,
        getQuizSubmissions,
        refresh,
      }}
    >
      {children}
    </AssignmentsContext.Provider>
  );
}

export function useAssignments() {
  const ctx = useContext(AssignmentsContext);
  if (!ctx) throw new Error("useAssignments must be used within AssignmentsProvider");
  return ctx;
}

export type { QuizQuestion };
